import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from 'next/app'
import { AuthContext, useNewAuth } from '@/lib/services/api/firebase';
import { ShowContext, ShowControlContext, useNewShowContext, useNewShowControl } from '@/lib/services/dmx/showControl';
import { ReactElement } from 'react';


export default function App({ Component, pageProps }: AppProps) {

	return <AuthContextWrapper>
		<ShowContextWrapper>
			<ShowControlContextWrapper>
			
				<Component {...pageProps} />

			</ShowControlContextWrapper>
		</ShowContextWrapper>
	</AuthContextWrapper>
}

interface WrapperProps {
	children: ReactElement;
}

const AuthContextWrapper = ({ children }: WrapperProps) => <AuthContext.Provider value={useNewAuth()}>
	{children}
</AuthContext.Provider>


const ShowContextWrapper = ({ children }: WrapperProps) => <ShowContext.Provider value={useNewShowContext()}>
	{children}
</ShowContext.Provider>

const ShowControlContextWrapper = ({ children }: WrapperProps) => <ShowControlContext.Provider value={useNewShowControl()}>
	{children}
</ShowControlContext.Provider>