import { type RestUserPrivate } from "../../../types/users";
import { createContext } from "preact";

export type User = RestUserPrivate & { patch: (user: Partial<RestUserPrivate>) => void };

export default createContext<User | null | undefined>(void 0);
