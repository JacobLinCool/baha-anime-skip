import { mapping } from "file-mapping";

const NO_MATCHED_CACHE = "./no-matched.cache";
const FAILED_CACHE = "./failed.cache";
export const no_matched_cache: Record<string, string[]> = mapping(NO_MATCHED_CACHE, {});
export const failed_cache: Record<string, string[]> = mapping(FAILED_CACHE, {});
