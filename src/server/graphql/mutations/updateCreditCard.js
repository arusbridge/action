import {GraphQLID, GraphQLNonNull} from 'graphql';
import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import getCCFromCustomer from 'server/graphql/mutations/helpers/getCCFromCustomer';
import UpdateCreditCardPayload from 'server/graphql/types/UpdateCreditCardPayload';
import {getUserId, getUserOrgDoc, isOrgBillingLeader} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {ORGANIZATION, TEAM} from 'universal/utils/constants';
import {sendOrgLeadAccessError} from 'server/utils/authorizationErrors';
import sendAuthRaven from 'server/utils/sendAuthRaven';

export default {
  type: UpdateCreditCardPayload,
  description: 'Update an existing credit card on file',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org requesting the changed billing'
    },
    stripeToken: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The token that came back from stripe'
    }
  },
  async resolve(source, {orgId, stripeToken}, {authToken, dataLoader, socketId: mutatorId}) {
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};
    const r = getRethink();
    const now = new Date();

    // AUTH
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    if (!isOrgBillingLeader(userOrgDoc)) return sendOrgLeadAccessError(authToken, userOrgDoc);

    // VALIDATION
    const {stripeId} = await r.table('Organization').get(orgId);

    if (!stripeId) {
      const breadcrumb = {
        message: 'Cannot update credit card without an active stripe subscription',
        category: 'Billing',
        data: {orgId}
      };
      return sendAuthRaven(authToken, 'Something went wrong', breadcrumb);
    }

    // RESOLUTION
    const customer = await stripe.customers.update(stripeId, {source: stripeToken});
    const creditCard = getCCFromCustomer(customer);
    const {updatedTeams} = await r({
      updatedOrg: r.table('Organization').get(orgId).update({
        creditCard,
        updatedAt: now
      }),
      updatedTeams: r.table('Team')
        .getAll(orgId, {index: 'orgId'})
        .update({
          isPaid: true,
          updatedAt: now
        }, {returnChanges: true})('changes')('new_val')
        .default([])
    });

    const teamIds = updatedTeams.map(({id}) => id);
    const data = {teamIds, orgId};

    teamIds.forEach((teamId) => {
      publish(TEAM, teamId, UpdateCreditCardPayload, data, subOptions);
    });

    publish(ORGANIZATION, orgId, UpdateCreditCardPayload, data, subOptions);

    return data;
  }
};
