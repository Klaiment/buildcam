import React from "react";

import { AlreadyConnected } from "@/components/login/AlreadyConnected";
import { LoginView } from "@/components/login/LoginView";
import { useLoginScreen } from "@/hooks/useLoginScreen";

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    sendingLink,
    verifyingLink,
    googleLoading,
    authLoading,
    checkingAuth,
    loadingRemember,
    currentUser,
    rememberMe,
    toggleRemember,
    isGoogleConfigured,
    isValidEmail,
    handleGoBack,
    handleGoProjects,
    handleSendMagicCode,
    handleGoogleSignIn,
    handlePasswordSignIn,
    handlePasswordSignUp,
  } = useLoginScreen();

  if (checkingAuth || loadingRemember) return null;

  if (currentUser) {
    return (
      <AlreadyConnected
        email={currentUser.email}
        onBack={handleGoBack}
        onGoProjects={handleGoProjects}
      />
    );
  }

  return (
    <LoginView
      email={email}
      password={password}
      rememberMe={rememberMe}
      isValidEmail={isValidEmail}
      isGoogleConfigured={isGoogleConfigured}
      sendingLink={sendingLink}
      verifyingLink={verifyingLink}
      googleLoading={googleLoading}
      authLoading={authLoading}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSendMagic={handleSendMagicCode}
      onGoogleSignIn={handleGoogleSignIn}
      onPasswordSignIn={handlePasswordSignIn}
      onPasswordSignUp={handlePasswordSignUp}
      onBack={handleGoBack}
      onToggleRemember={toggleRemember}
    />
  );
}
