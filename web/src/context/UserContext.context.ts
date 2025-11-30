import { createContext } from "react";
import type { UserContextValue } from "./UserContext.types";

export const UserContext = createContext<UserContextValue | undefined>(undefined);
