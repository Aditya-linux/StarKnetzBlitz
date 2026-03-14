import { NextRequest, NextResponse } from "next/server";

const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const RPC_URL = "https://rpc.starknet-testnet.lava.build";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Missing address parameter" }, { status: 400 });
  }

  try {
    // Call balanceOf on the STRK ERC-20 contract via JSON-RPC
    const response = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "starknet_call",
        params: [
          {
            contract_address: STRK_ADDRESS,
            entry_point_selector: "0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e", // selector for "balanceOf"
            calldata: [address],
          },
          "pending",
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("[API/balance] RPC error:", data.error);
      return NextResponse.json({ balance: "0", error: data.error.message });
    }

    // result is an array of felts [low, high] for u256
    const result = data.result;
    if (!result || result.length < 2) {
      return NextResponse.json({ balance: "0" });
    }

    const low = BigInt(result[0]);
    const high = BigInt(result[1]);
    const totalWei = low + (high << BigInt(128));
    
    // Convert from wei (18 decimals) to STRK
    const balanceStr = Number(totalWei) / 1e18;

    return NextResponse.json({ balance: balanceStr.toFixed(4) });
  } catch (err: any) {
    console.error("[API/balance] Fetch error:", err.message);
    return NextResponse.json({ balance: "0", error: err.message });
  }
}
