import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from 'next/app'
import { AuthContext, UseNewAuth } from '@/lib/services/api/firebase';
import { ShowControlContext, useNewShowControl } from '@/lib/services/dmx/showControl';
import { DmxControlContext, useNewDmxControl } from '@/lib/services/dmx/dmxControl';
import { ReactElement } from 'react';


export default function App({ Component, pageProps }: AppProps) {

	
	const showControl = useNewShowControl();
	const dmxControl = useNewDmxControl();

	return <AuthContextWrapper>
		<DmxControlContextWrapper>
			<ShowControlContextWrapper>
				
				<Component {...pageProps} />

			</ShowControlContextWrapper>
		</DmxControlContextWrapper>
	</AuthContextWrapper>
}

interface WrapperProps {
	children: ReactElement;
}

const AuthContextWrapper = ({ children }: WrapperProps) => <AuthContext.Provider value={UseNewAuth()}>
	{children}
</AuthContext.Provider>

const DmxControlContextWrapper = ({ children }: WrapperProps) => <DmxControlContext.Provider value={useNewDmxControl()}>
	{children}
</DmxControlContext.Provider>

const ShowControlContextWrapper = ({ children }: WrapperProps) => <ShowControlContext.Provider value={useNewShowControl()}>
	{children}
</ShowControlContext.Provider>