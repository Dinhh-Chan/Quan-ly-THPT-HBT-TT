import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntApp, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { BRAND } from "./config/brand";
import "./styles.css";

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ConfigProvider
            locale={viVN}
            theme={{
                token: {
                    colorPrimary: BRAND.colors.blue,
                    colorInfo: BRAND.colors.blue,
                    colorSuccess: "#14920A",
                    colorWarning: BRAND.colors.orange,
                    colorError: BRAND.colors.red,
                    colorLink: BRAND.colors.blue,
                    borderRadius: 8,
                    fontFamily: "'Be Vietnam Pro', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                },
                components: {
                    Layout: { siderBg: "#ffffff", headerBg: "#ffffff", bodyBg: "#f3f6fc" },
                    Menu: { itemSelectedBg: "#e6efff", itemSelectedColor: BRAND.colors.blue, itemBorderRadius: 8 },
                    Card: { headerFontSize: 15 },
                },
            }}
        >
            <AntApp>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </QueryClientProvider>
            </AntApp>
        </ConfigProvider>
    </StrictMode>,
);
