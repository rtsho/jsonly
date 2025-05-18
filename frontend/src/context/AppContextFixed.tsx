// This is the fixed version of the signUpWithEmail function
// Replace the existing signUpWithEmail function in AppContext.tsx with this one

const signUpWithEmail = async (email: string, password: string) => {
  // Create a reference to the Firestore write hook
  const { queueWrite } = useFirestoreWrite();
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      // Generate clientId and clientSecret
      const clientId = uuidv4();
      const clientSecret = uuidv4();

      // Logging before Firestore write
      console.log("Attempting to write new user to Firestore:", {
        uid: userCredential.user.uid,
        clientId,
        clientSecret,
        email: userCredential.user.email,
      });

      // Queue the write to Firestore using our hook
      queueWrite(
        "users",
        userCredential.user.uid,
        {
          clientId,
          clientSecret,
          email: userCredential.user.email,
          createdAt: new Date().toISOString(),
        },
        () => {
          console.log("Successfully wrote new user to Firestore:", userCredential.user.uid);
        },
        (firestoreError) => {
          console.error("Firestore write error:", firestoreError);
          setError(
            firestoreError instanceof Error
              ? firestoreError.message
              : 'Failed to save user credentials to Firestore'
          );
        }
      );

      const actionCodeSettings = {
        url: 'http://localhost:5173/verify-email',
        handleCodeInApp: false,
      };
      sendEmailVerification(userCredential.user, actionCodeSettings);
      setUser(null);
    }
  } catch (error: any) {
    console.error("Error in signUpWithEmail main try/catch:", error);
    if (error.code === 'auth/email-already-in-use') {
      setError('Email already in use');
    } else if (error.code === 'auth/weak-password') {
      setError('Password should be at least 6 characters');
    } else if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('Failed to create account');
    }
  } finally {
    console.log("signUpWithEmail function completed (success or error).");
  }
};