import ResetPassword from "@/components/auth/ResetPassword";

interface ResetPasswordPageProps {
    params: {
        token: string;
    };
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
    const awaitedParams = await params;

    const token = awaitedParams.token;

    return <ResetPassword token={token} />
}
