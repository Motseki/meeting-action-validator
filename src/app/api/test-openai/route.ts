import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if API key is set
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔍 Checking OpenAI API key...');
    console.log(`API Key exists: ${!!apiKey}`);
    console.log(`API Key starts with sk-: ${apiKey?.startsWith('sk-') || false}`);
    console.log(`API Key length: ${apiKey?.length || 0}`);

    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'OPENAI_API_KEY is not set in environment variables',
        details: 'Please add your API key to .env.local file'
      }, { status: 500 });
    }

    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid API key format',
        details: 'API key should start with "sk-"'
      }, { status: 500 });
    }

    // Try to make a simple API call
    console.log('📤 Testing OpenAI API call...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Say "Hello!"' }
        ],
        max_tokens: 10
      })
    });

    console.log(`📥 OpenAI response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI error response:', errorText);
      return NextResponse.json({
        status: 'error',
        message: `OpenAI API returned ${response.status}`,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ OpenAI API test successful!');
    
    return NextResponse.json({
      status: 'success',
      message: 'OpenAI API is working!',
      response: data.choices?.[0]?.message?.content || 'No response',
      apiKeySet: true,
      apiKeyPreview: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
    });
  } catch (error: any) {
    console.error('❌ Test error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}