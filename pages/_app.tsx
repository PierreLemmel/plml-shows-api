import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from 'next/app'
import { AuthContext, useNewAuth } from '@/lib/services/api/firebase';
import { ShowContext, ShowControlContext, useNewShowContext, useNewShowControl } from '@/lib/services/dmx/showControl';
import { DmxControlContext, useNewDmxControl } from '@/lib/services/dmx/dmxControl';
import { ReactElement } from 'react';


export default function App({ Component, pageProps }: AppProps) {

	return <AuthContextWrapper>
		<DmxControlContextWrapper>
			<ShowContextWrapper>
				<ShowControlContextWrapper>
				
					<Component {...pageProps} />

				</ShowControlContextWrapper>
			</ShowContextWrapper>
		</DmxControlContextWrapper>
	</AuthContextWrapper>
}

interface WrapperProps {
	children: ReactElement;
}

const AuthContextWrapper = ({ children }: WrapperProps) => {
	const context = useNewAuth();

	return <AuthContext.Provider value={useNewAuth()}>
		{children}
	</AuthContext.Provider>;
}

const DmxControlContextWrapper = ({ children }: WrapperProps) => {
	const context = useNewDmxControl();

	return <DmxControlContext.Provider value={context}>
		{children}
	</DmxControlContext.Provider>;
}

const ShowControlContextWrapper = ({ children }: WrapperProps) => {
	const context = useNewShowControl();

	return <ShowControlContext.Provider value={context}>
		{children}
	</ShowControlContext.Provider>;
}

const ShowContextWrapper = ({ children }: WrapperProps) => {
	const context = useNewShowContext();

	return <ShowContext.Provider value={context}>
		{children}
	</ShowContext.Provider>;
}