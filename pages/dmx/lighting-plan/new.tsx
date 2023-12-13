import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";

const NewLightingPlanPage = () => {

    return <AleasMainLayout
        description="Nouveau plan de feu"
        toasts
        requireAuth
        navbar
    >
        Nouveau plan de feu
    </AleasMainLayout>
}

export default NewLightingPlanPage;