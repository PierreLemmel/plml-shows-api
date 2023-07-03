import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from 'next/app'
import { AuthContext, useNewAuth } from '@/lib/services/api/firebase';
import { ShowControlContext, useNewShowControl } from '@/lib/services/dmx/showControl';
import { DmxControlContext, useNewDmxControl } from '@/lib/services/dmx/dmxControl';
import { ReactElement } from 'react';


export default function App({ Component, pageProps }: AppProps) {

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

const AuthContextWrapper = ({ children }: WrapperProps) => <AuthContext.Provider value={useNewAuth()}>
	{children}
</AuthContext.Provider>

const DmxControlContextWrapper = ({ children }: WrapperProps) => <DmxControlContext.Provider value={useNewDmxControl()}>
	{children}
</DmxControlContext.Provider>

const ShowControlContextWrapper = ({ children }: WrapperProps) => <ShowControlContext.Provider value={useNewShowControl()}>
	{children}
</ShowControlContext.Provider>