import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  registerIssuer(context: __compactRuntime.CircuitContext<PS>,
                 ownerKey_0: Uint8Array,
                 issuerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeIssuer(context: __compactRuntime.CircuitContext<PS>,
               ownerKey_0: Uint8Array,
               issuerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  issuerKey_0: Uint8Array,
                  certificateId_0: Uint8Array,
                  holderId_0: Uint8Array,
                  score_0: bigint,
                  opening_0: Uint8Array,
                  skill_0: Uint8Array,
                  credentialType_0: Uint8Array,
                  issuedAt_0: bigint,
                  expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   issuerKey_0: Uint8Array,
                   credentialCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  createVerificationRequest(context: __compactRuntime.CircuitContext<PS>,
                            requestId_0: Uint8Array,
                            verifierId_0: Uint8Array,
                            requiredSkill_0: Uint8Array,
                            requiredCredentialType_0: Uint8Array,
                            threshold_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  respondToVerification(context: __compactRuntime.CircuitContext<PS>,
                        requestId_0: Uint8Array,
                        certificateId_0: Uint8Array,
                        holderId_0: Uint8Array,
                        score_0: bigint,
                        opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  verifySkillThreshold(context: __compactRuntime.CircuitContext<PS>,
                       certificateId_0: Uint8Array,
                       holderId_0: Uint8Array,
                       score_0: bigint,
                       opening_0: Uint8Array,
                       credentialCommitment_0: Uint8Array,
                       threshold_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type ProvableCircuits<PS> = {
  registerIssuer(context: __compactRuntime.CircuitContext<PS>,
                 ownerKey_0: Uint8Array,
                 issuerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeIssuer(context: __compactRuntime.CircuitContext<PS>,
               ownerKey_0: Uint8Array,
               issuerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  issuerKey_0: Uint8Array,
                  certificateId_0: Uint8Array,
                  holderId_0: Uint8Array,
                  score_0: bigint,
                  opening_0: Uint8Array,
                  skill_0: Uint8Array,
                  credentialType_0: Uint8Array,
                  issuedAt_0: bigint,
                  expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   issuerKey_0: Uint8Array,
                   credentialCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  createVerificationRequest(context: __compactRuntime.CircuitContext<PS>,
                            requestId_0: Uint8Array,
                            verifierId_0: Uint8Array,
                            requiredSkill_0: Uint8Array,
                            requiredCredentialType_0: Uint8Array,
                            threshold_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  respondToVerification(context: __compactRuntime.CircuitContext<PS>,
                        requestId_0: Uint8Array,
                        certificateId_0: Uint8Array,
                        holderId_0: Uint8Array,
                        score_0: bigint,
                        opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  verifySkillThreshold(context: __compactRuntime.CircuitContext<PS>,
                       certificateId_0: Uint8Array,
                       holderId_0: Uint8Array,
                       score_0: bigint,
                       opening_0: Uint8Array,
                       credentialCommitment_0: Uint8Array,
                       threshold_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  registerIssuer(context: __compactRuntime.CircuitContext<PS>,
                 ownerKey_0: Uint8Array,
                 issuerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeIssuer(context: __compactRuntime.CircuitContext<PS>,
               ownerKey_0: Uint8Array,
               issuerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  issuerKey_0: Uint8Array,
                  certificateId_0: Uint8Array,
                  holderId_0: Uint8Array,
                  score_0: bigint,
                  opening_0: Uint8Array,
                  skill_0: Uint8Array,
                  credentialType_0: Uint8Array,
                  issuedAt_0: bigint,
                  expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   issuerKey_0: Uint8Array,
                   credentialCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  createVerificationRequest(context: __compactRuntime.CircuitContext<PS>,
                            requestId_0: Uint8Array,
                            verifierId_0: Uint8Array,
                            requiredSkill_0: Uint8Array,
                            requiredCredentialType_0: Uint8Array,
                            threshold_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  respondToVerification(context: __compactRuntime.CircuitContext<PS>,
                        requestId_0: Uint8Array,
                        certificateId_0: Uint8Array,
                        holderId_0: Uint8Array,
                        score_0: bigint,
                        opening_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  verifySkillThreshold(context: __compactRuntime.CircuitContext<PS>,
                       certificateId_0: Uint8Array,
                       holderId_0: Uint8Array,
                       score_0: bigint,
                       opening_0: Uint8Array,
                       credentialCommitment_0: Uint8Array,
                       threshold_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  readonly owner: Uint8Array;
  authorizedIssuers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  credentials: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { skill: Uint8Array,
                                 credentialType: Uint8Array,
                                 issuer: Uint8Array,
                                 issuedAt: bigint,
                                 expiresAt: bigint,
                                 revoked: boolean
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { skill: Uint8Array,
  credentialType: Uint8Array,
  issuer: Uint8Array,
  issuedAt: bigint,
  expiresAt: bigint,
  revoked: boolean
}]>
  };
  readonly credentialCount: bigint;
  requests: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { requiredSkill: Uint8Array,
                                 requiredCredentialType: Uint8Array,
                                 threshold: bigint,
                                 verifier: Uint8Array,
                                 result: { is_some: boolean, value: boolean }
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { requiredSkill: Uint8Array,
  requiredCredentialType: Uint8Array,
  threshold: bigint,
  verifier: Uint8Array,
  result: { is_some: boolean, value: boolean }
}]>
  };
  readonly requestCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               ownerId_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
