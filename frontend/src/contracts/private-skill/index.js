import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_2 = __compactRuntime.CompactTypeBoolean;

class _Maybe_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment());
  }
  fromValue(value_0) {
    return {
      is_some: _descriptor_2.fromValue(value_0),
      value: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.is_some).concat(_descriptor_2.toValue(value_0.value));
  }
}

const _descriptor_3 = new _Maybe_0();

class _VerificationRequest_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment()))));
  }
  fromValue(value_0) {
    return {
      requiredSkill: _descriptor_0.fromValue(value_0),
      requiredCredentialType: _descriptor_0.fromValue(value_0),
      threshold: _descriptor_1.fromValue(value_0),
      verifier: _descriptor_0.fromValue(value_0),
      result: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.requiredSkill).concat(_descriptor_0.toValue(value_0.requiredCredentialType).concat(_descriptor_1.toValue(value_0.threshold).concat(_descriptor_0.toValue(value_0.verifier).concat(_descriptor_3.toValue(value_0.result)))));
  }
}

const _descriptor_4 = new _VerificationRequest_0();

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _CredentialRecord_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment().concat(_descriptor_2.alignment())))));
  }
  fromValue(value_0) {
    return {
      skill: _descriptor_0.fromValue(value_0),
      credentialType: _descriptor_0.fromValue(value_0),
      issuer: _descriptor_0.fromValue(value_0),
      issuedAt: _descriptor_5.fromValue(value_0),
      expiresAt: _descriptor_5.fromValue(value_0),
      revoked: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.skill).concat(_descriptor_0.toValue(value_0.credentialType).concat(_descriptor_0.toValue(value_0.issuer).concat(_descriptor_5.toValue(value_0.issuedAt).concat(_descriptor_5.toValue(value_0.expiresAt).concat(_descriptor_2.toValue(value_0.revoked))))));
  }
}

const _descriptor_6 = new _CredentialRecord_0();

const _descriptor_7 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

class _CredentialSecret_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      certificateId: _descriptor_0.fromValue(value_0),
      holderId: _descriptor_0.fromValue(value_0),
      score: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.certificateId).concat(_descriptor_0.toValue(value_0.holderId).concat(_descriptor_1.toValue(value_0.score)));
  }
}

const _descriptor_8 = new _CredentialSecret_0();

class _Either_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_2.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_9 = new _Either_0();

const _descriptor_10 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_11 = new _ContractAddress_0();

const _descriptor_12 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      registerIssuer: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`registerIssuer: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const ownerKey_0 = args_1[1];
        const issuerKey_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerIssuer',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-skill.compact line 116 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(ownerKey_0.buffer instanceof ArrayBuffer && ownerKey_0.BYTES_PER_ELEMENT === 1 && ownerKey_0.length === 32)) {
          __compactRuntime.typeError('registerIssuer',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-skill.compact line 116 char 1',
                                     'Bytes<32>',
                                     ownerKey_0)
        }
        if (!(issuerKey_0.buffer instanceof ArrayBuffer && issuerKey_0.BYTES_PER_ELEMENT === 1 && issuerKey_0.length === 32)) {
          __compactRuntime.typeError('registerIssuer',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-skill.compact line 116 char 1',
                                     'Bytes<32>',
                                     issuerKey_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(ownerKey_0).concat(_descriptor_0.toValue(issuerKey_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._registerIssuer_0(context,
                                                partialProofData,
                                                ownerKey_0,
                                                issuerKey_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      revokeIssuer: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`revokeIssuer: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const ownerKey_0 = args_1[1];
        const issuerKey_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('revokeIssuer',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-skill.compact line 123 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(ownerKey_0.buffer instanceof ArrayBuffer && ownerKey_0.BYTES_PER_ELEMENT === 1 && ownerKey_0.length === 32)) {
          __compactRuntime.typeError('revokeIssuer',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-skill.compact line 123 char 1',
                                     'Bytes<32>',
                                     ownerKey_0)
        }
        if (!(issuerKey_0.buffer instanceof ArrayBuffer && issuerKey_0.BYTES_PER_ELEMENT === 1 && issuerKey_0.length === 32)) {
          __compactRuntime.typeError('revokeIssuer',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-skill.compact line 123 char 1',
                                     'Bytes<32>',
                                     issuerKey_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(ownerKey_0).concat(_descriptor_0.toValue(issuerKey_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._revokeIssuer_0(context,
                                              partialProofData,
                                              ownerKey_0,
                                              issuerKey_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      issueCredential: (...args_1) => {
        if (args_1.length !== 10) {
          throw new __compactRuntime.CompactError(`issueCredential: expected 10 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const issuerKey_0 = args_1[1];
        const certificateId_0 = args_1[2];
        const holderId_0 = args_1[3];
        const score_0 = args_1[4];
        const opening_0 = args_1[5];
        const skill_0 = args_1[6];
        const credentialType_0 = args_1[7];
        const issuedAt_0 = args_1[8];
        const expiresAt_0 = args_1[9];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('issueCredential',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-skill.compact line 141 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(issuerKey_0.buffer instanceof ArrayBuffer && issuerKey_0.BYTES_PER_ELEMENT === 1 && issuerKey_0.length === 32)) {
          __compactRuntime.typeError('issueCredential',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-skill.compact line 141 char 1',
                                     'Bytes<32>',
                                     issuerKey_0)
        }
        if (!(certificateId_0.buffer instanceof ArrayBuffer && certificateId_0.BYTES_PER_ELEMENT === 1 && certificateId_0.length === 32)) {
          __compactRuntime.typeError('issueCredential',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-skill.compact line 141 char 1',
                                     'Bytes<32>',
                                     certificateId_0)
        }
        if (!(holderId_0.buffer instanceof ArrayBuffer && holderId_0.BYTES_PER_ELEMENT === 1 && holderId_0.length === 32)) {
          __compactRuntime.typeError('issueCredential',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-skill.compact line 141 char 1',
                                     'Bytes<32>',
                                     holderId_0)
        }
        if (!(typeof(score_0) === 'bigint' && score_0 >= 0n && score_0 <= 65535n)) {
          __compactRuntime.typeError('issueCredential',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-skill.compact line 141 char 1',
                                     'Uint<0..65536>',
                                     score_0)
        }
        if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
          __compactRuntime.typeError('issueCredential',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'private-skill.compact line 141 char 1',
                                     'Bytes<32>',
                                     opening_0)
        }
        if (!(skill_0.buffer instanceof ArrayBuffer && skill_0.BYTES_PER_ELEMENT === 1 && skill_0.length === 32)) {
          __compactRuntime.typeError('issueCredential',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'private-skill.compact line 141 char 1',
                                     'Bytes<32>',
                                     skill_0)
        }
        if (!(credentialType_0.buffer instanceof ArrayBuffer && credentialType_0.BYTES_PER_ELEMENT === 1 && credentialType_0.length === 32)) {
          __compactRuntime.typeError('issueCredential',
                                     'argument 7 (argument 8 as invoked from Typescript)',
                                     'private-skill.compact line 141 char 1',
                                     'Bytes<32>',
                                     credentialType_0)
        }
        if (!(typeof(issuedAt_0) === 'bigint' && issuedAt_0 >= 0n && issuedAt_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('issueCredential',
                                     'argument 8 (argument 9 as invoked from Typescript)',
                                     'private-skill.compact line 141 char 1',
                                     'Uint<0..18446744073709551616>',
                                     issuedAt_0)
        }
        if (!(typeof(expiresAt_0) === 'bigint' && expiresAt_0 >= 0n && expiresAt_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('issueCredential',
                                     'argument 9 (argument 10 as invoked from Typescript)',
                                     'private-skill.compact line 141 char 1',
                                     'Uint<0..18446744073709551616>',
                                     expiresAt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(issuerKey_0).concat(_descriptor_0.toValue(certificateId_0).concat(_descriptor_0.toValue(holderId_0).concat(_descriptor_1.toValue(score_0).concat(_descriptor_0.toValue(opening_0).concat(_descriptor_0.toValue(skill_0).concat(_descriptor_0.toValue(credentialType_0).concat(_descriptor_5.toValue(issuedAt_0).concat(_descriptor_5.toValue(expiresAt_0))))))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_5.alignment()))))))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._issueCredential_0(context,
                                                 partialProofData,
                                                 issuerKey_0,
                                                 certificateId_0,
                                                 holderId_0,
                                                 score_0,
                                                 opening_0,
                                                 skill_0,
                                                 credentialType_0,
                                                 issuedAt_0,
                                                 expiresAt_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      revokeCredential: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`revokeCredential: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const issuerKey_0 = args_1[1];
        const credentialCommitment_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('revokeCredential',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-skill.compact line 189 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(issuerKey_0.buffer instanceof ArrayBuffer && issuerKey_0.BYTES_PER_ELEMENT === 1 && issuerKey_0.length === 32)) {
          __compactRuntime.typeError('revokeCredential',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-skill.compact line 189 char 1',
                                     'Bytes<32>',
                                     issuerKey_0)
        }
        if (!(credentialCommitment_0.buffer instanceof ArrayBuffer && credentialCommitment_0.BYTES_PER_ELEMENT === 1 && credentialCommitment_0.length === 32)) {
          __compactRuntime.typeError('revokeCredential',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-skill.compact line 189 char 1',
                                     'Bytes<32>',
                                     credentialCommitment_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(issuerKey_0).concat(_descriptor_0.toValue(credentialCommitment_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._revokeCredential_0(context,
                                                  partialProofData,
                                                  issuerKey_0,
                                                  credentialCommitment_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      createVerificationRequest: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`createVerificationRequest: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const requestId_0 = args_1[1];
        const verifierId_0 = args_1[2];
        const requiredSkill_0 = args_1[3];
        const requiredCredentialType_0 = args_1[4];
        const threshold_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('createVerificationRequest',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-skill.compact line 210 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(requestId_0.buffer instanceof ArrayBuffer && requestId_0.BYTES_PER_ELEMENT === 1 && requestId_0.length === 32)) {
          __compactRuntime.typeError('createVerificationRequest',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-skill.compact line 210 char 1',
                                     'Bytes<32>',
                                     requestId_0)
        }
        if (!(verifierId_0.buffer instanceof ArrayBuffer && verifierId_0.BYTES_PER_ELEMENT === 1 && verifierId_0.length === 32)) {
          __compactRuntime.typeError('createVerificationRequest',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-skill.compact line 210 char 1',
                                     'Bytes<32>',
                                     verifierId_0)
        }
        if (!(requiredSkill_0.buffer instanceof ArrayBuffer && requiredSkill_0.BYTES_PER_ELEMENT === 1 && requiredSkill_0.length === 32)) {
          __compactRuntime.typeError('createVerificationRequest',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-skill.compact line 210 char 1',
                                     'Bytes<32>',
                                     requiredSkill_0)
        }
        if (!(requiredCredentialType_0.buffer instanceof ArrayBuffer && requiredCredentialType_0.BYTES_PER_ELEMENT === 1 && requiredCredentialType_0.length === 32)) {
          __compactRuntime.typeError('createVerificationRequest',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-skill.compact line 210 char 1',
                                     'Bytes<32>',
                                     requiredCredentialType_0)
        }
        if (!(typeof(threshold_0) === 'bigint' && threshold_0 >= 0n && threshold_0 <= 65535n)) {
          __compactRuntime.typeError('createVerificationRequest',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'private-skill.compact line 210 char 1',
                                     'Uint<0..65536>',
                                     threshold_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(requestId_0).concat(_descriptor_0.toValue(verifierId_0).concat(_descriptor_0.toValue(requiredSkill_0).concat(_descriptor_0.toValue(requiredCredentialType_0).concat(_descriptor_1.toValue(threshold_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._createVerificationRequest_0(context,
                                                           partialProofData,
                                                           requestId_0,
                                                           verifierId_0,
                                                           requiredSkill_0,
                                                           requiredCredentialType_0,
                                                           threshold_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      respondToVerification: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`respondToVerification: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const requestId_0 = args_1[1];
        const certificateId_0 = args_1[2];
        const holderId_0 = args_1[3];
        const score_0 = args_1[4];
        const opening_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('respondToVerification',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-skill.compact line 238 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(requestId_0.buffer instanceof ArrayBuffer && requestId_0.BYTES_PER_ELEMENT === 1 && requestId_0.length === 32)) {
          __compactRuntime.typeError('respondToVerification',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-skill.compact line 238 char 1',
                                     'Bytes<32>',
                                     requestId_0)
        }
        if (!(certificateId_0.buffer instanceof ArrayBuffer && certificateId_0.BYTES_PER_ELEMENT === 1 && certificateId_0.length === 32)) {
          __compactRuntime.typeError('respondToVerification',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-skill.compact line 238 char 1',
                                     'Bytes<32>',
                                     certificateId_0)
        }
        if (!(holderId_0.buffer instanceof ArrayBuffer && holderId_0.BYTES_PER_ELEMENT === 1 && holderId_0.length === 32)) {
          __compactRuntime.typeError('respondToVerification',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-skill.compact line 238 char 1',
                                     'Bytes<32>',
                                     holderId_0)
        }
        if (!(typeof(score_0) === 'bigint' && score_0 >= 0n && score_0 <= 65535n)) {
          __compactRuntime.typeError('respondToVerification',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-skill.compact line 238 char 1',
                                     'Uint<0..65536>',
                                     score_0)
        }
        if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
          __compactRuntime.typeError('respondToVerification',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'private-skill.compact line 238 char 1',
                                     'Bytes<32>',
                                     opening_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(requestId_0).concat(_descriptor_0.toValue(certificateId_0).concat(_descriptor_0.toValue(holderId_0).concat(_descriptor_1.toValue(score_0).concat(_descriptor_0.toValue(opening_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._respondToVerification_0(context,
                                                       partialProofData,
                                                       requestId_0,
                                                       certificateId_0,
                                                       holderId_0,
                                                       score_0,
                                                       opening_0);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      verifySkillThreshold: (...args_1) => {
        if (args_1.length !== 7) {
          throw new __compactRuntime.CompactError(`verifySkillThreshold: expected 7 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const certificateId_0 = args_1[1];
        const holderId_0 = args_1[2];
        const score_0 = args_1[3];
        const opening_0 = args_1[4];
        const credentialCommitment_0 = args_1[5];
        const threshold_0 = args_1[6];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('verifySkillThreshold',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-skill.compact line 287 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(certificateId_0.buffer instanceof ArrayBuffer && certificateId_0.BYTES_PER_ELEMENT === 1 && certificateId_0.length === 32)) {
          __compactRuntime.typeError('verifySkillThreshold',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-skill.compact line 287 char 1',
                                     'Bytes<32>',
                                     certificateId_0)
        }
        if (!(holderId_0.buffer instanceof ArrayBuffer && holderId_0.BYTES_PER_ELEMENT === 1 && holderId_0.length === 32)) {
          __compactRuntime.typeError('verifySkillThreshold',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-skill.compact line 287 char 1',
                                     'Bytes<32>',
                                     holderId_0)
        }
        if (!(typeof(score_0) === 'bigint' && score_0 >= 0n && score_0 <= 65535n)) {
          __compactRuntime.typeError('verifySkillThreshold',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-skill.compact line 287 char 1',
                                     'Uint<0..65536>',
                                     score_0)
        }
        if (!(opening_0.buffer instanceof ArrayBuffer && opening_0.BYTES_PER_ELEMENT === 1 && opening_0.length === 32)) {
          __compactRuntime.typeError('verifySkillThreshold',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-skill.compact line 287 char 1',
                                     'Bytes<32>',
                                     opening_0)
        }
        if (!(credentialCommitment_0.buffer instanceof ArrayBuffer && credentialCommitment_0.BYTES_PER_ELEMENT === 1 && credentialCommitment_0.length === 32)) {
          __compactRuntime.typeError('verifySkillThreshold',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'private-skill.compact line 287 char 1',
                                     'Bytes<32>',
                                     credentialCommitment_0)
        }
        if (!(typeof(threshold_0) === 'bigint' && threshold_0 >= 0n && threshold_0 <= 65535n)) {
          __compactRuntime.typeError('verifySkillThreshold',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'private-skill.compact line 287 char 1',
                                     'Uint<0..65536>',
                                     threshold_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(certificateId_0).concat(_descriptor_0.toValue(holderId_0).concat(_descriptor_1.toValue(score_0).concat(_descriptor_0.toValue(opening_0).concat(_descriptor_0.toValue(credentialCommitment_0).concat(_descriptor_1.toValue(threshold_0)))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment())))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._verifySkillThreshold_0(context,
                                                      partialProofData,
                                                      certificateId_0,
                                                      holderId_0,
                                                      score_0,
                                                      opening_0,
                                                      credentialCommitment_0,
                                                      threshold_0);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      registerIssuer: this.circuits.registerIssuer,
      revokeIssuer: this.circuits.revokeIssuer,
      issueCredential: this.circuits.issueCredential,
      revokeCredential: this.circuits.revokeCredential,
      createVerificationRequest: this.circuits.createVerificationRequest,
      respondToVerification: this.circuits.respondToVerification,
      verifySkillThreshold: this.circuits.verifySkillThreshold
    };
    this.provableCircuits = {
      registerIssuer: this.circuits.registerIssuer,
      revokeIssuer: this.circuits.revokeIssuer,
      issueCredential: this.circuits.issueCredential,
      revokeCredential: this.circuits.revokeCredential,
      createVerificationRequest: this.circuits.createVerificationRequest,
      respondToVerification: this.circuits.respondToVerification,
      verifySkillThreshold: this.circuits.verifySkillThreshold
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const ownerId_0 = args_0[1];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(ownerId_0.buffer instanceof ArrayBuffer && ownerId_0.BYTES_PER_ELEMENT === 1 && ownerId_0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 1 (argument 2 as invoked from Typescript)',
                                 'private-skill.compact line 89 char 1',
                                 'Bytes<32>',
                                 ownerId_0)
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('registerIssuer', new __compactRuntime.ContractOperation());
    state_0.setOperation('revokeIssuer', new __compactRuntime.ContractOperation());
    state_0.setOperation('issueCredential', new __compactRuntime.ContractOperation());
    state_0.setOperation('revokeCredential', new __compactRuntime.ContractOperation());
    state_0.setOperation('createVerificationRequest', new __compactRuntime.ContractOperation());
    state_0.setOperation('respondToVerification', new __compactRuntime.ContractOperation());
    state_0.setOperation('verifySkillThreshold', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(0n),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(1n),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(2n),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(3n),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(4n),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(5n),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(0n),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(ownerId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _some_0(value_0) { return { is_some: true, value: value_0 }; }
  _none_0() { return { is_some: false, value: false }; }
  _blockTimeLt_0(context, partialProofData, time_0) {
    return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 2 } },
                                                                      { idx: { cached: true,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_12.toValue(2n),
                                                                                                 alignment: _descriptor_12.alignment() } }] } },
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(time_0),
                                                                                                                             alignment: _descriptor_5.alignment() }).encode() } },
                                                                      'lt',
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value);
  }
  _blockTimeGte_0(context, partialProofData, time_0) {
    return !this._blockTimeLt_0(context, partialProofData, time_0);
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_7, value_0);
    return result_0;
  }
  _persistentCommit_0(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_8,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _domainHash_0(domain_0, value_0) {
    return this._persistentHash_0([domain_0, value_0]);
  }
  _issuerId_0(issuerKey_0) {
    return this._domainHash_0(new Uint8Array([112, 114, 105, 118, 97, 116, 101, 115, 107, 105, 108, 108, 58, 105, 115, 115, 117, 101, 114, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                              issuerKey_0);
  }
  _ownerId_0(ownerKey_0) {
    return this._domainHash_0(new Uint8Array([112, 114, 105, 118, 97, 116, 101, 115, 107, 105, 108, 108, 58, 111, 119, 110, 101, 114, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                              ownerKey_0);
  }
  _registerIssuer_0(context, partialProofData, ownerKey_0, issuerKey_0) {
    __compactRuntime.assert(this._equal_0(this._ownerId_0(ownerKey_0),
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_12.toValue(0n),
                                                                                                                                alignment: _descriptor_12.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Only the contract owner can authorize issuers');
    const tmp_0 = this._issuerId_0(issuerKey_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(1n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _revokeIssuer_0(context, partialProofData, ownerKey_0, issuerKey_0) {
    __compactRuntime.assert(this._equal_1(this._ownerId_0(ownerKey_0),
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_12.toValue(0n),
                                                                                                                                alignment: _descriptor_12.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Only the contract owner can revoke issuers');
    const tmp_0 = this._issuerId_0(issuerKey_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(1n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { rem: { cached: false } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _issueCredential_0(context,
                     partialProofData,
                     issuerKey_0,
                     certificateId_0,
                     holderId_0,
                     score_0,
                     opening_0,
                     skill_0,
                     credentialType_0,
                     issuedAt_0,
                     expiresAt_0)
  {
    let tmp_0;
    __compactRuntime.assert((tmp_0 = this._issuerId_0(issuerKey_0),
                             _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_12.toValue(1n),
                                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'Issuer is not authorized');
    __compactRuntime.assert(expiresAt_0 > issuedAt_0,
                            'Expiry must be after the issue date');
    __compactRuntime.assert(!this._blockTimeGte_0(context,
                                                  partialProofData,
                                                  expiresAt_0),
                            'Cannot issue an already-expired credential');
    const commitment_0 = this._persistentCommit_0({ certificateId:
                                                      certificateId_0,
                                                    holderId: holderId_0,
                                                    score: score_0 },
                                                  opening_0);
    __compactRuntime.assert(!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_12.toValue(2n),
                                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(commitment_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Credential already registered');
    const tmp_1 = { skill: skill_0,
                    credentialType: credentialType_0,
                    issuer: this._issuerId_0(issuerKey_0),
                    issuedAt: issuedAt_0,
                    expiresAt: expiresAt_0,
                    revoked: false };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(2n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(commitment_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(tmp_1),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_2 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(3n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_1.toValue(tmp_2),
                                                                alignment: _descriptor_1.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return commitment_0;
  }
  _revokeCredential_0(context,
                      partialProofData,
                      issuerKey_0,
                      credentialCommitment_0)
  {
    let tmp_0;
    __compactRuntime.assert((tmp_0 = this._issuerId_0(issuerKey_0),
                             _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_12.toValue(1n),
                                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'Issuer is not authorized');
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_12.toValue(2n),
                                                                                                                  alignment: _descriptor_12.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(credentialCommitment_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Credential not found');
    const record_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_12.toValue(2n),
                                                                                                           alignment: _descriptor_12.alignment() } }] } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_0.toValue(credentialCommitment_0),
                                                                                                           alignment: _descriptor_0.alignment() } }] } },
                                                                                { popeq: { cached: false,
                                                                                           result: undefined } }]).value);
    __compactRuntime.assert(this._equal_2(record_0.issuer,
                                          this._issuerId_0(issuerKey_0)),
                            'Only the issuing issuer can revoke this credential');
    const tmp_1 = { skill: record_0.skill,
                    credentialType: record_0.credentialType,
                    issuer: record_0.issuer,
                    issuedAt: record_0.issuedAt,
                    expiresAt: record_0.expiresAt,
                    revoked: true };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(2n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(credentialCommitment_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(tmp_1),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _createVerificationRequest_0(context,
                               partialProofData,
                               requestId_0,
                               verifierId_0,
                               requiredSkill_0,
                               requiredCredentialType_0,
                               threshold_0)
  {
    __compactRuntime.assert(!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_12.toValue(4n),
                                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(requestId_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Request id already used');
    const tmp_0 = { requiredSkill: requiredSkill_0,
                    requiredCredentialType: requiredCredentialType_0,
                    threshold: threshold_0,
                    verifier: verifierId_0,
                    result: this._none_0() };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(4n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(requestId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(5n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_1.toValue(tmp_1),
                                                                alignment: _descriptor_1.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _respondToVerification_0(context,
                           partialProofData,
                           requestId_0,
                           certificateId_0,
                           holderId_0,
                           score_0,
                           opening_0)
  {
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_12.toValue(4n),
                                                                                                                  alignment: _descriptor_12.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(requestId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Request not found');
    const request_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_12.toValue(4n),
                                                                                                            alignment: _descriptor_12.alignment() } }] } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_0.toValue(requestId_0),
                                                                                                            alignment: _descriptor_0.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value);
    __compactRuntime.assert(!request_0.result.is_some,
                            'Request has already been answered');
    const commitment_0 = this._persistentCommit_0({ certificateId:
                                                      certificateId_0,
                                                    holderId: holderId_0,
                                                    score: score_0 },
                                                  opening_0);
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_12.toValue(2n),
                                                                                                                  alignment: _descriptor_12.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(commitment_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Credential is not registered');
    const record_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_12.toValue(2n),
                                                                                                           alignment: _descriptor_12.alignment() } }] } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_0.toValue(commitment_0),
                                                                                                           alignment: _descriptor_0.alignment() } }] } },
                                                                                { popeq: { cached: false,
                                                                                           result: undefined } }]).value);
    __compactRuntime.assert(this._equal_3(record_0.skill,
                                          request_0.requiredSkill),
                            'Credential skill does not match the request');
    __compactRuntime.assert(this._equal_4(record_0.credentialType,
                                          request_0.requiredCredentialType),
                            'Credential type does not match the request');
    __compactRuntime.assert(!record_0.revoked, 'Credential has been revoked');
    __compactRuntime.assert(!this._blockTimeGte_0(context,
                                                  partialProofData,
                                                  record_0.expiresAt),
                            'Credential has expired');
    let tmp_0;
    __compactRuntime.assert((tmp_0 = record_0.issuer,
                             _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_12.toValue(1n),
                                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'Issuing institution is not authorized');
    const passed_0 = score_0 >= request_0.threshold;
    const tmp_1 = { requiredSkill: request_0.requiredSkill,
                    requiredCredentialType: request_0.requiredCredentialType,
                    threshold: request_0.threshold,
                    verifier: request_0.verifier,
                    result: this._some_0(passed_0) };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_12.toValue(4n),
                                                                  alignment: _descriptor_12.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(requestId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_1),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return passed_0;
  }
  _verifySkillThreshold_0(context,
                          partialProofData,
                          certificateId_0,
                          holderId_0,
                          score_0,
                          opening_0,
                          credentialCommitment_0,
                          threshold_0)
  {
    const commitment_0 = this._persistentCommit_0({ certificateId:
                                                      certificateId_0,
                                                    holderId: holderId_0,
                                                    score: score_0 },
                                                  opening_0);
    __compactRuntime.assert(this._equal_5(commitment_0, credentialCommitment_0),
                            'Commitment does not match credential');
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_12.toValue(2n),
                                                                                                                  alignment: _descriptor_12.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(credentialCommitment_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Credential is not registered');
    const record_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_12.toValue(2n),
                                                                                                           alignment: _descriptor_12.alignment() } }] } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_0.toValue(credentialCommitment_0),
                                                                                                           alignment: _descriptor_0.alignment() } }] } },
                                                                                { popeq: { cached: false,
                                                                                           result: undefined } }]).value);
    __compactRuntime.assert(!record_0.revoked, 'Credential has been revoked');
    __compactRuntime.assert(!this._blockTimeGte_0(context,
                                                  partialProofData,
                                                  record_0.expiresAt),
                            'Credential has expired');
    let tmp_0;
    __compactRuntime.assert((tmp_0 = record_0.issuer,
                             _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_12.toValue(1n),
                                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'Issuing institution is not authorized');
    return score_0 >= threshold_0;
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get owner() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_12.toValue(0n),
                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    authorizedIssuers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(1n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                                                                 alignment: _descriptor_5.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(1n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-skill.compact line 80 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(1n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    credentials: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(2n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                                                                 alignment: _descriptor_5.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(2n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-skill.compact line 81 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(2n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'private-skill.compact line 81 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(2n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[2];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_6.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get credentialCount() {
      return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_12.toValue(3n),
                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    requests: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(4n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                                                                 alignment: _descriptor_5.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(4n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-skill.compact line 83 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(4n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'private-skill.compact line 83 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_12.toValue(4n),
                                                                                                     alignment: _descriptor_12.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_4.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get requestCount() {
      return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_12.toValue(5n),
                                                                                                   alignment: _descriptor_12.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
export const pureCircuits = {};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
