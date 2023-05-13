import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from 'next/app'
import { AuthContext, useAuth } from '@/lib/services/api/firebase';
import { ShowControlContext, useShowControl } from '@/lib/services/dmx/showControl';
import { DmxControlContext, useDmxControl } from '@/lib/services/dmx/dmxControl';


export default function App({ Component, pageProps }: AppProps) {

	const auth = useAuth();
	const showControl = useShowControl();
	const dmxControl = useDmxControl();

	return <AuthContext.Provider value={auth}>
		<ShowControlContext.Provider value={showControl}>
			<DmxControlContext.Provider value={dmxControl}>
				
				<Component {...pageProps} />

			</DmxControlContext.Provider>
		</ShowControlContext.Provider>
	</AuthContext.Provider>
}