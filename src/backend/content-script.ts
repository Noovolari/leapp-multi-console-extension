import { initProviders } from "./init-providers";

const providers = initProviders();
providers.extractSessionIdService.listen();
