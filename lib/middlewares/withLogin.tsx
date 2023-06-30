import { AleasMainLayout } from '@/components/aleas/aleas-layout';
import AleasSpinningLoader from '@/components/aleas/aleas-spinning-loader';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../services/api/firebase';

export function withLogin(Component: React.ComponentType<any>) {
    return (props: any) => {

        const router = useRouter();
        const auth = useAuth();

        const { user, initialized } = auth;

        useEffect(() => {
            if (initialized && !user) {
                router.push({
                    pathname: "/login",
                    query: {
                        redirectTo: router.asPath
                    }}
                );
            }
        }, [initialized])

        if (initialized) {
            if (!user) {
                
                return <AleasMainLayout modal navbar={false}>
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-2xl font-bold">Veuillez vous connecter</div>
                        <AleasSpinningLoader />
                    </div>
                </AleasMainLayout>;
            }
            else {
                return <Component {...props} />;
            }
        }
        else {
            return <AleasMainLayout modal navbar={false}>
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-2xl font-bold">Veuillez patienter</div>
                    <AleasSpinningLoader />
                </div>
            </AleasMainLayout>;
        }
    };
}