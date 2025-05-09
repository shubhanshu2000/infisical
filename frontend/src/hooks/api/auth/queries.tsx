import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import SecurityClient from "@app/components/utilities/SecurityClient";
import { apiRequest } from "@app/config/request";
import { SessionStorageKeys } from "@app/const";

import { organizationKeys } from "../organization/queries";
import { setAuthToken } from "../reactQuery";
import { workspaceKeys } from "../workspace";
import {
  ChangePasswordDTO,
  CompleteAccountDTO,
  CompleteAccountSignupDTO,
  GetAuthTokenAPI,
  GetBackupEncryptedPrivateKeyDTO,
  IssueBackupPrivateKeyDTO,
  Login1DTO,
  Login1Res,
  Login2DTO,
  Login2Res,
  LoginLDAPDTO,
  LoginLDAPRes,
  MfaMethod,
  ResetPasswordDTO,
  ResetPasswordV2DTO,
  ResetUserPasswordV2DTO,
  SendMfaTokenDTO,
  SetupPasswordDTO,
  SRP1DTO,
  SRPR1Res,
  TOauthTokenExchangeDTO,
  UserAgentType,
  UserEncryptionVersion,
  VerifyMfaTokenDTO,
  VerifyMfaTokenRes,
  VerifySignupInviteDTO
} from "./types";

export const authKeys = {
  getAuthToken: ["token"] as const
};

export const login1 = async (loginDetails: Login1DTO) => {
  const { data } = await apiRequest.post<Login1Res>("/api/v3/auth/login1", loginDetails);
  return data;
};

export const login2 = async (loginDetails: Login2DTO) => {
  const { data } = await apiRequest.post<Login2Res>("/api/v3/auth/login2", loginDetails);
  return data;
};

export const loginLDAPRedirect = async (loginLDAPDetails: LoginLDAPDTO) => {
  const { data } = await apiRequest.post<LoginLDAPRes>("/api/v1/ldap/login", loginLDAPDetails); // return if account is complete or not + provider auth token
  return data;
};

export const useLogin1 = () => {
  return useMutation({
    mutationFn: async (details: {
      email: string;
      clientPublicKey: string;
      providerAuthToken?: string;
    }) => {
      return login1(details);
    }
  });
};

export const selectOrganization = async (data: {
  organizationId: string;
  userAgent?: UserAgentType;
}) => {
  const { data: res } = await apiRequest.post<{
    token: string;
    isMfaEnabled: boolean;
    mfaMethod?: MfaMethod;
  }>("/api/v3/auth/select-organization", data);
  return res;
};

export const useSelectOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (details: { organizationId: string; userAgent?: UserAgentType }) => {
      const data = await selectOrganization(details);

      // If a custom user agent is set, then this session is meant for another consuming application, not the web application.
      if (!details.userAgent && !data.isMfaEnabled) {
        SecurityClient.setToken(data.token);
        SecurityClient.setProviderAuthToken("");
      }

      if (data.token && !data.isMfaEnabled) {
        // We check if there is a pending callback after organization login success and redirect to it if valid
        const loginRedirectInfo = sessionStorage.getItem(
          SessionStorageKeys.ORG_LOGIN_SUCCESS_REDIRECT_URL
        );
        sessionStorage.removeItem(SessionStorageKeys.ORG_LOGIN_SUCCESS_REDIRECT_URL);

        if (loginRedirectInfo) {
          const { expiry, data: redirectUrl } = JSON.parse(loginRedirectInfo);
          if (new Date() < new Date(expiry)) {
            window.location.assign(redirectUrl);
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [organizationKeys.getUserOrganizations, workspaceKeys.getAllUserWorkspace]
      });
    }
  });
};

export const useLogin2 = () => {
  return useMutation({
    mutationFn: async (details: {
      email: string;
      clientProof: string;
      password: string;
      providerAuthToken?: string;
    }) => {
      return login2(details);
    }
  });
};

export const oauthTokenExchange = async (details: TOauthTokenExchangeDTO) => {
  const { data } = await apiRequest.post<Login2Res>("/api/v1/sso/token-exchange", details);
  return data;
};

export const useOauthTokenExchange = () => {
  // note: use after srp1
  return useMutation({
    mutationFn: async (details: TOauthTokenExchangeDTO) => {
      return oauthTokenExchange(details);
    }
  });
};

export const srp1 = async (details: SRP1DTO) => {
  const { data } = await apiRequest.post<SRPR1Res>("/api/v1/password/srp1", details);
  return data;
};

export const completeAccountSignup = async (details: CompleteAccountSignupDTO) => {
  const { data } = await apiRequest.post("/api/v3/signup/complete-account/signup", details);
  return data;
};

export const completeAccountSignupInvite = async (details: CompleteAccountDTO) => {
  const { data } = await apiRequest.post("/api/v3/signup/complete-account/invite", details);
  return data;
};

export const useCompleteAccountSignup = () => {
  return useMutation({
    mutationFn: async (details: CompleteAccountSignupDTO) => {
      return completeAccountSignup(details);
    }
  });
};

export const useSendMfaToken = () => {
  return useMutation<object, object, SendMfaTokenDTO>({
    mutationFn: async ({ email }) => {
      const { data } = await apiRequest.post("/api/v2/auth/mfa/send", { email });
      return data;
    }
  });
};

export const verifyMfaToken = async ({
  email,
  mfaCode,
  mfaMethod
}: {
  email: string;
  mfaCode: string;
  mfaMethod?: string;
}) => {
  const { data } = await apiRequest.post("/api/v2/auth/mfa/verify", {
    email,
    mfaToken: mfaCode,
    mfaMethod
  });

  return data;
};

export const useVerifyMfaToken = () => {
  return useMutation<VerifyMfaTokenRes, object, VerifyMfaTokenDTO>({
    mutationFn: async ({ email, mfaCode, mfaMethod }) => {
      return verifyMfaToken({
        email,
        mfaCode,
        mfaMethod
      });
    }
  });
};

export const verifySignupInvite = async (details: VerifySignupInviteDTO) => {
  const { data } = await apiRequest.post("/api/v1/invite-org/verify", details);
  return data;
};

export const useSendVerificationEmail = () => {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { data } = await apiRequest.post("/api/v3/signup/email/signup", {
        email
      });

      return data;
    }
  });
};

export const useVerifySignupEmailVerificationCode = () => {
  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      const { data } = await apiRequest.post("/api/v3/signup/email/verify", {
        email,
        code
      });

      return data;
    }
  });
};

export const useSendPasswordResetEmail = () => {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { data } = await apiRequest.post("/api/v1/password/email/password-reset", {
        email
      });

      return data;
    }
  });
};

export const useVerifyPasswordResetCode = () => {
  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      const { data } = await apiRequest.post<{
        token: string;
        userEncryptionVersion: UserEncryptionVersion;
      }>("/api/v1/password/email/password-reset-verify", {
        email,
        code
      });

      return data;
    }
  });
};

export const issueBackupPrivateKey = async (details: IssueBackupPrivateKeyDTO) => {
  const { data } = await apiRequest.post("/api/v1/password/backup-private-key", details);
  return data;
};

export const getBackupEncryptedPrivateKey = async ({
  verificationToken
}: GetBackupEncryptedPrivateKeyDTO) => {
  const { data } = await apiRequest.get("/api/v1/password/backup-private-key", {
    headers: {
      Authorization: `Bearer ${verificationToken}`
    }
  });

  return data.backupPrivateKey;
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (details: ResetPasswordDTO) => {
      const { data } = await apiRequest.post(
        "/api/v1/password/password-reset",
        {
          protectedKey: details.protectedKey,
          protectedKeyIV: details.protectedKeyIV,
          protectedKeyTag: details.protectedKeyTag,
          encryptedPrivateKey: details.encryptedPrivateKey,
          encryptedPrivateKeyIV: details.encryptedPrivateKeyIV,
          encryptedPrivateKeyTag: details.encryptedPrivateKeyTag,
          salt: details.salt,
          verifier: details.verifier,
          password: details.password
        },
        {
          headers: {
            Authorization: `Bearer ${details.verificationToken}`
          }
        }
      );

      return data;
    }
  });
};

export const useResetPasswordV2 = () => {
  return useMutation({
    mutationFn: async (details: ResetPasswordV2DTO) => {
      await apiRequest.post("/api/v2/password/password-reset", details, {
        headers: {
          Authorization: `Bearer ${details.verificationToken}`
        }
      });
    }
  });
};

export const useResetUserPasswordV2 = () => {
  return useMutation({
    mutationFn: async (details: ResetUserPasswordV2DTO) => {
      await apiRequest.post("/api/v2/password/user/password-reset", details);
    }
  });
};

export const changePassword = async (details: ChangePasswordDTO) => {
  const { data } = await apiRequest.post("/api/v1/password/change-password", details);
  return data;
};

export const useChangePassword = () => {
  // note: use after srp1
  return useMutation({
    mutationFn: async (details: ChangePasswordDTO) => {
      return changePassword(details);
    }
  });
};

// Refresh token is set as cookie when logged in
// Using that we fetch the auth bearer token needed for auth calls
export const fetchAuthToken = async () => {
  const { data } = await apiRequest.post<GetAuthTokenAPI>("/api/v1/auth/token", undefined, {
    withCredentials: true
  });
  setAuthToken(data.token);
  return data;
};

export const useGetAuthToken = () =>
  useQuery({
    queryKey: authKeys.getAuthToken,
    queryFn: fetchAuthToken,
    retry: 0
  });

export const checkUserTotpMfa = async () => {
  const { data } = await apiRequest.get<{ isVerified: boolean }>("/api/v2/auth/mfa/check/totp");

  return data.isVerified;
};

export const useSendPasswordSetupEmail = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiRequest.post("/api/v1/password/email/password-setup");

      return data;
    }
  });
};

export const useSetupPassword = () => {
  return useMutation({
    mutationFn: async (payload: SetupPasswordDTO) => {
      const { data } = await apiRequest.post("/api/v1/password/password-setup", payload);

      return data;
    }
  });
};
