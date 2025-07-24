import { newAuthenticateCmd } from './commands/authenticate-cmd'
import { newCreateOrgUserCmd } from './commands/create-org-user-cmd'
import { newInviteUserCmd } from './commands/invite-user-cmd'
import { newListAllOrgsCmd } from './commands/list-all-orgs-cmd'
import { newGetOrgCmd } from './commands/get-org-cmd'
import { newSendOtpCmd } from './commands/send-otp-cmd'
import { newOrganizationRepo } from './repo/organization-repo'
import { newUserRepo } from './repo/user-repo'
import { newSendGridEmailService } from './services/email-service'
import { authenticated, logout, setSession, withSession } from './session'
import { newGetRoleCmd } from './commands/get-role-cmd'
import { newGetOrgMembersCmd } from './commands/get-org-members-cmd'
import { newRemoveOrgMemberCmd } from './commands/remove-org-member-cmd'
import { newGetOrgRouteDataCmd } from './commands/get-org-route-data-cmd'

// Repos
const userRepo = newUserRepo()
const organizationRepo = newOrganizationRepo()

// Services
const emailService = newSendGridEmailService()

// Commands
const authenticateCmd = newAuthenticateCmd(userRepo)
const inviteUserCmd = newInviteUserCmd(emailService)
const getOrgCmd = newGetOrgCmd(organizationRepo)
const getOrgMembersCmd = newGetOrgMembersCmd(organizationRepo)
const getRoleCmd = newGetRoleCmd(organizationRepo)
const createOrgUserCmd = newCreateOrgUserCmd(
  organizationRepo,
  userRepo,
  inviteUserCmd,
)
const sendOtpCmd = newSendOtpCmd(emailService, userRepo)
const listAllOrgsCmd = newListAllOrgsCmd(organizationRepo)
const removeOrgMemberCmd = newRemoveOrgMemberCmd(organizationRepo, userRepo)
const getOrgRouteDataCmd = newGetOrgRouteDataCmd(organizationRepo)

export const app = {
  authenticate: authenticateCmd,
  createOrgUser: createOrgUserCmd,
  inviteUser: inviteUserCmd,
  getOrg: getOrgCmd,
  getOrgRouteData: getOrgRouteDataCmd,
  getOrgMembers: getOrgMembersCmd,
  getRole: getRoleCmd,
  listAllOrgs: listAllOrgsCmd,
  removeOrgMember: removeOrgMemberCmd,
  sendOtp: sendOtpCmd,
  session: {
    set: setSession,
    authenticated,
    withSession,
    logout,
  },
}

export type App = typeof app
