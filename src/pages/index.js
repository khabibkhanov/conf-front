import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1>Welcome to the Conference Translator</h1>
            <div style={{ marginTop: '20px' }}>
                <button
                    style={{ padding: '10px 20px', fontSize: '18px', marginRight: '10px' }}
                    onClick={() => router.push('/speaker')}
                >
                    Speaker
                </button>
                <button
                    style={{ padding: '10px 20px', fontSize: '18px', marginLeft: '10px' }}
                    onClick={() => router.push('/listener')}
                >
                    Listener
                </button>
            </div>
        </div>
    );
}
