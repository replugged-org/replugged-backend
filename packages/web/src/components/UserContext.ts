/*
 * Copyright (c) 2018-2022 Replugged Developers
 * Licensed under the Open Software License version 3.0
 * SPDX-License-Identifier: OSL-3.0
 */

import type { RestUserPrivate } from '@replugged/types/users'
import { createContext } from 'preact'

export type User = RestUserPrivate & { patch: (user: Partial<RestUserPrivate>) => void }

export default createContext<User | null | undefined>(void 0)
