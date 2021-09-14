import React, { ReactNode } from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { store } from "store";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <ConfigProvider autoInsertSpaceInButton={false} locale={zhCN}>
        <Router>{children}</Router>
      </ConfigProvider>
    </Provider>
  );
};
