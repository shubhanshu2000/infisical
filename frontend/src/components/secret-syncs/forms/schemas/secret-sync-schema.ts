import { z } from "zod";

import { AwsSecretsManagerSyncDestinationSchema } from "@app/components/secret-syncs/forms/schemas/aws-secrets-manager-sync-destination-schema";
import { DatabricksSyncDestinationSchema } from "@app/components/secret-syncs/forms/schemas/databricks-sync-destination-schema";
import { GitHubSyncDestinationSchema } from "@app/components/secret-syncs/forms/schemas/github-sync-destination-schema";

import { AwsParameterStoreSyncDestinationSchema } from "./aws-parameter-store-sync-destination-schema";
import { AzureAppConfigurationSyncDestinationSchema } from "./azure-app-configuration-sync-destination-schema";
import { AzureKeyVaultSyncDestinationSchema } from "./azure-key-vault-sync-destination-schema";
import { GcpSyncDestinationSchema } from "./gcp-sync-destination-schema";
import { HumanitecSyncDestinationSchema } from "./humanitec-sync-destination-schema";
import { VercelSyncDestinationSchema } from "./vercel-sync-destination-schema";

const SecretSyncUnionSchema = z.discriminatedUnion("destination", [
  AwsParameterStoreSyncDestinationSchema,
  AwsSecretsManagerSyncDestinationSchema,
  GitHubSyncDestinationSchema,
  GcpSyncDestinationSchema,
  AzureKeyVaultSyncDestinationSchema,
  AzureAppConfigurationSyncDestinationSchema,
  DatabricksSyncDestinationSchema,
  HumanitecSyncDestinationSchema,
  VercelSyncDestinationSchema
]);

export const SecretSyncFormSchema = SecretSyncUnionSchema;

export const UpdateSecretSyncFormSchema = SecretSyncUnionSchema;

export type TSecretSyncForm = z.infer<typeof SecretSyncFormSchema>;
