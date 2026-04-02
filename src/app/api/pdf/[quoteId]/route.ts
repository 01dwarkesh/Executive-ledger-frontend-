import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await params
  const token = request.headers.get('authorization')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/quotes/${quoteId}/export-pdf`

  try {
    const response = await fetch(backendUrl, {
      headers: { Authorization: token },
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${text}` },
        { status: response.status }
      )
    }

    const blob = await response.blob()
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quoteId}.pdf"`,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 500 })
  }
}
