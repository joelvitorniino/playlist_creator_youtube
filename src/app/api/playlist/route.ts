import { NextRequest, NextResponse } from "next/server";
const ytdl = require("ytdl-core");

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    const info = await ytdl.getInfo(url);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const urlMusic = audioFormats[0].url;

    return NextResponse.json({ urlMusic });
}