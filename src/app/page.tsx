"use client"
import { ROUTES } from "@/core/routes";
import { Card, CardBody, CardFooter, Chip, CircularProgress } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  // automatci value change from 0 to 100 in 5 seconds , gradually
  const [finalDestination, setFinalDestination] = useState("");
  const [value, setValue] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("currentUserToken");
    const rememberMeTimeStr = localStorage.getItem("rememberMeTime");
    const rememberMeTime = rememberMeTimeStr ? JSON.parse(rememberMeTimeStr) : null;

    if (!token || (rememberMeTime && rememberMeTime < new Date().getTime())) {
      setFinalDestination("Redirecting to login page...");
      setLoadingComplete(true);
      return;
    }

    if (token) {
      fetch("http://localhost:5000/api/v1/check-user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch user data");
          }
          return res.json();
        })
        .then((data) => {
          setFinalDestination("Redirecting to dashboard...");
          setLoadingComplete(true);
          console.log(data);

          router.push(`/dashboard/${data.data.user.Role.roleName.toLowerCase()}`);
        })
        .catch((error) => {
          console.error(error);
          setFinalDestination("Redirecting to login page...");
          setLoadingComplete(true);
          router.push("/auth");
        });
    }

    const interval = setInterval(() => {
      setValue((prev) => {
        const newValue = prev + 1;

        if (newValue >= 100) {
          clearInterval(interval);
          if (!loadingComplete) {
            setFinalDestination("Redirecting to login page...");
            router.push("/auth");
          }
        }

        return newValue;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [router, loadingComplete]);
  return (
    <div className="flex h-screen relative w-full m-0 p-0 justify-center items-center flex-col bg-[#F6F8FB]">
      <Card className="w-[240px] h-[240px] border-none bg-gradient-to-br from-blue-500 to-fuchsia-500">
        <CardBody className="justify-center items-center pb-0">
          <CircularProgress
            classNames={{
              svg: "w-36 h-36 drop-shadow-md",
              indicator: "stroke-white",
              track: "stroke-white/10",
              value: "text-3xl font-semibold text-white",
            }}
            value={value}
            strokeWidth={4}
            showValueLabel={true}
          />
        </CardBody>
        <CardFooter className="justify-center items-center pt-0">
          <Chip
            classNames={{
              base: "border-1 border-white/30",
              content: "text-white/90 text-small font-semibold",
            }}
            variant="bordered"
          >
            {
              // for every 10 value, we show a different message
              value < 10
                ? "Starting..."
                : value < 20
                  ? "Loading..."
                  : value < 30
                    ? "Almost there..."
                    : value < 40
                      ? "Halfway there..."
                      : value < 50
                        ? "Halfway there..."
                        : value < 60
                          ? "More than halfway there..."
                          : value < 70
                            ? "Almost done..."
                            : value < 80
                              ? "Finishing up..."
                              : value < 90
                                ? "Almost there..."
                                : value < 100
                                  ? "Finishing up..."
                                  : finalDestination

            }
          </Chip>
        </CardFooter>
      </Card>
    </div>
  );
}