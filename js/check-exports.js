import * as protobuf from "@bufbuild/protobuf";
console.log("All exports from @bufbuild/protobuf:");
console.log(JSON.stringify(Object.keys(protobuf), null, 2));
console.log("\nMethodKind in exports:", "MethodKind" in protobuf);

if ("MethodKind" in protobuf) {
  console.log("\n✓ MethodKind is found in @bufbuild/protobuf");
} else {
  console.log("\n✗ MethodKind is NOT found in @bufbuild/protobuf");
}

import * as connect from "@connectrpc/connect";
console.log("\nExports from @connectrpc/connect:");
console.log(Object.keys(connect));
console.log("\nMethodKind in @connectrpc/connect exports:", "MethodKind" in connect);