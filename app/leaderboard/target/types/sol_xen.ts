/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sol_xen.json`.
 */
export type SolXen = {
  address: "7LBe4g8Q6hq8Sk1nT8tQUiz2mCHjsoQJbmZ7zCQtutuT";
  metadata: {
    name: "solXen";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "createMint";
      discriminator: [69, 44, 215, 132, 253, 214, 41, 45];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "globalXnRecord";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  120,
                  110,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114,
                ];
              },
            ];
          };
        },
        {
          name: "mintAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 105, 110, 116];
              },
            ];
          };
        },
        {
          name: "metadata";
          writable: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "tokenMetadataProgram";
          address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "metadata";
          type: {
            defined: {
              name: "initTokenParams";
            };
          };
        },
      ];
    },
    {
      name: "mintTokens";
      discriminator: [59, 132, 24, 246, 122, 39, 8, 243];
      accounts: [
        {
          name: "userTokenAccount";
          writable: true;
        },
        {
          name: "globalXnRecord";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  120,
                  110,
                  45,
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114,
                ];
              },
            ];
          };
        },
        {
          name: "xnByEth";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [120, 110, 45, 98, 121, 45, 101, 116, 104];
              },
              {
                kind: "arg";
                path: "_eth_account.address";
              },
            ];
          };
        },
        {
          name: "xnBySol";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [120, 110, 45, 98, 121, 45, 115, 111, 108];
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "mintAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 105, 110, 116];
              },
            ];
          };
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
      ];
      args: [
        {
          name: "ethAccount";
          type: {
            defined: {
              name: "ethAccount";
            };
          };
        },
      ];
    },
  ];
  accounts: [
    {
      name: "globalXnRecord";
      discriminator: [29, 48, 183, 205, 201, 7, 241, 7];
    },
    {
      name: "userEthXnRecord";
      discriminator: [224, 152, 129, 49, 149, 104, 210, 196];
    },
    {
      name: "userSolXnRecord";
      discriminator: [105, 200, 79, 162, 225, 52, 172, 238];
    },
  ];
  events: [
    {
      name: "hashEvent";
      discriminator: [72, 165, 108, 28, 78, 144, 127, 138];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "mintIsAlreadyActive";
      msg: "solXEN Mint has been already initialized";
    },
    {
      code: 6001;
      name: "mintIsNotActive";
      msg: "solXEN Mint has not yet started or is over";
    },
    {
      code: 6002;
      name: "zeroSlotValue";
      msg: "Slot value is Zero";
    },
  ];
  types: [
    {
      name: "ethAccount";
      type: {
        kind: "struct";
        fields: [
          {
            name: "address";
            type: {
              array: ["u8", 20];
            };
          },
        ];
      };
    },
    {
      name: "globalXnRecord";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amp";
            type: "u16";
          },
          {
            name: "lastAmpSlot";
            type: "u64";
          },
          {
            name: "hashes";
            type: "u64";
          },
          {
            name: "superhashes";
            type: "u64";
          },
          {
            name: "txs";
            type: "u64";
          },
          {
            name: "nonce";
            type: {
              array: ["u8", 4];
            };
          },
        ];
      };
    },
    {
      name: "hashEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "slot";
            type: "u64";
          },
          {
            name: "user";
            type: "pubkey";
          },
          {
            name: "ethAccount";
            type: {
              array: ["u8", 20];
            };
          },
          {
            name: "hashes";
            type: "u8";
          },
          {
            name: "superhashes";
            type: "u8";
          },
          {
            name: "points";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "initTokenParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "symbol";
            type: "string";
          },
          {
            name: "uri";
            type: "string";
          },
          {
            name: "decimals";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "userEthXnRecord";
      type: {
        kind: "struct";
        fields: [
          {
            name: "hashes";
            type: "u64";
          },
          {
            name: "superhashes";
            type: "u32";
          },
        ];
      };
    },
    {
      name: "userSolXnRecord";
      type: {
        kind: "struct";
        fields: [
          {
            name: "hashes";
            type: "u64";
          },
          {
            name: "superhashes";
            type: "u32";
          },
          {
            name: "points";
            type: "u128";
          },
        ];
      };
    },
  ];
};
