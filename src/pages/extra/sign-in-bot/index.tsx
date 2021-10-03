import { useEffect, useState } from "react";
import * as d3 from "d3";

interface SignInDataItem {
  record_id: number;
  user_id: string;
  date: string;
  sign_in_type: string;
  origin_message: string;
}

export const SignInGraph = () => {
  const [data, setData] = useState<SignInDataItem[] | undefined>();

  useEffect(() => {
    d3.json("../../experiment-data/extra/sign-in-bot/sign_in_log.json").then(
      (data) => {
        setData(data as SignInDataItem[]);
        console.log(data);
      }
    );
  }, []);

  return <>{`${data}`}</>;
};
