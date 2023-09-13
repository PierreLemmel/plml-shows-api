import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import { useAuth } from "@/lib/services/api/firebase";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";

export interface LoginProps {
}

const Login = (props: LoginProps) => {

    
    const auth = useAuth();
    const router = useRouter();

    const { user, signInWithGoogle, signOut } = auth;

    const returnUrl = useMemo(() => {
        const returnUrl = router.query.redirectTo as string;
        return returnUrl || "/";
    }, [router.query.redirectTo]);

    const onLoginClicked = useCallback(async () => {
        await signInWithGoogle();
        router.push(returnUrl);
    }, [])
    const onLogout = useCallback(async () => await signOut(), [])
    
    const loggedIn = user !== null;

    return <AleasMainLayout title="Se connecter" modal navbar={false}>
        <div className="flex flex-col items-center justify-center h-full gap-6">
            {user ? <div>Actuellement connecté·e en tant que <strong>{user.displayName}</strong></div> : <div>Non connecté·e</div>}
            <div className="flex flex-row items-center justify-center gap-6">
                <AleasButton
                    disabled={loggedIn}
                    onClick={onLoginClicked}
                >
                    Se connecter
                </AleasButton>
                <AleasButton
                    disabled={!loggedIn}
                    onClick={onLogout}
                >
                    Se déconnecter
                </AleasButton>
            </div>
        </div>
    </AleasMainLayout>
}

export default Login;