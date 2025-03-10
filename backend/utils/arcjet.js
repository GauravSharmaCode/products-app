import arcjet, {tokenBucket, shield, detectBot} from "@arcjet/node";

import "dotenv/config";

export const arcjetMiddleware = arcjet({
  key: process.env.ARCJET_API_KEY,
  environment: process.env.NODE_ENV,
//   logLevel: "info",
  // Use a token bucket to limit requests to 10 per minute
  characteristics:["ip.src"],
  rules: [
    shield({mode:"LIVE"}),
    // Allow search engine bots
    detectBot({mode:"LIVE",
        allow:["CATEGORY: SEARCH_ENGINE"]
    }),
    tokenBucket({
        mode:"LIVE",
        refillRate: 10,
        interval:10,
        capacity: 10,
    }),

  ]
})
;