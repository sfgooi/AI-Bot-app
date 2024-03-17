"use client";
import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../../../firebase";

type Inputs = {
  email: string;
  password: string;
};

const Login = () => {
  const [isAuthMode, setIsAuthMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleClose = () => {
    setSnackbarOpen(false);
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (isAuthMode) {
      await createUserWithEmailAndPassword(auth, data.email, data.password)
        .then((userCredential) => {
          const user = userCredential.user;
          setIsAuthMode(false);
          setSnackbarOpen(true);
        })
        .catch((error) => {
          if (error.code === "auth/email-already-in-use") {
            alert("このメールアドレスは既に使用されています。");
          } else {
            alert(error.message);
          }
        });
    } else {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, data.email, data.password)
        .then((userCredential) => {
          const user = userCredential.user;
          router.push("/");
        })
        .catch((error) => {
          if (error.code === "auth/invalid-credential") {
            alert("そのようなユーザーは存在されていません。");
          } else {
            alert(error.message);
          }
        });
    }
  };

  return (
    <>
      <div>
        <video
          autoPlay
          muted
          loop
          ref={videoRef}
          className="absolute z-[-1] w-full h-full object-cover filter blur-sm contrast-100"
        >
          <source src="/videos/registerVideos.mp4" type="video/mp4" />
        </video>
      </div>
      <form
        className="h-screen flex flex-col items-center justify-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Paper
          className="p-8 w-[80vw] h-[50vh] sm:w-[50vw] md:w-[35vw]"
          elevation={4}
        >
          <Typography className="text-center" variant={"h5"} sx={{ m: "30px" }}>
            {isAuthMode ? "新規登録" : "ログイン"}
          </Typography>
          <div className="flex flex-col gap-8 pt-8 pb-4">
            <TextField
              placeholder="Email*"
              type="email"
              variant="standard"
              fullWidth
              autoComplete="email"
              {...register("email", {
                required: "メールアドレスは必須です。",
                pattern: {
                  value:
                    /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/,
                  message: "不適切なメールアドレスです。",
                },
              })}
            />
            {errors.email && (
              <span className="text-red-600 text-sm">
                {errors.email.message}
              </span>
            )}
            <TextField
              placeholder="Password*"
              type="password"
              variant="standard"
              fullWidth
              autoComplete="current-password"
              {...register("password", {
                required: "パスワードは必須です。",
                minLength: {
                  value: 8,
                  message: "8文字以上のパスワードを入力してください。",
                },
              })}
            />
            {errors.password && (
              <span className="text-red-600 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>
          <Box mt={4}>
            <Button
              className="justify-center hover:bg-blue-700 hover:text-white"
              type="submit"
              color="primary"
              variant="outlined"
              fullWidth
            >
              {isAuthMode ? "新規登録" : "ログイン"}
            </Button>
            <Typography marginTop={3} variant="caption" display="block">
              <Button
                className="p-0"
                onClick={() => {
                  setIsAuthMode(!isAuthMode);
                }}
              >
                {isAuthMode ? "ログイン" : "新規登録"}
              </Button>
              は{isAuthMode ? "こちらから" : "お済みですか？"}
            </Typography>
          </Box>
        </Paper>
      </form>
      <Box sx={{ width: 500 }}>
        <Snackbar
          open={snackbarOpen}
          onClose={handleClose}
          message="新規登録が完了しました。"
        />
      </Box>
    </>
  );
};

export default Login;
