import { useQueryState } from "nuqs";
import { useState, useEffect } from "react";
import axios from "axios";

interface Product {
  id: string;
  displayName: string;
  imageUrl: string;
  // Add other product properties as needed
}

interface Option {
  option_id_s: string;
  option_type_name_s: string;
  option_value_s: string;
  sort_priority_i: number;
  sort_priority_type_i: number;
  type_id_s: string;
}

interface OptionBucket {
  doc_count: number;
  key: string;
  options: {
    hits: {
      hits: Array<{
        _source: Option;
        status: string;
      }>;
    };
  };
}

interface ApiResponse {
  options_detail: {
    aggregations: {
      by_type: {
        buckets: OptionBucket[];
      };
    };
  };
  sku_response: {
    hits: {
      hits: Array<{
        _source: { id: string };
      }>;
    };
  };
}

function App() {
  const [productId] = useQueryState("productId", {
    defaultValue: "prod34521304",
  });
  const [sku, setSku] = useState<string | null>(null);

  console.log({ productId });

  const [selectedOptionIds, setSelectedOptionIds] = useQueryState("optionIds", {
    defaultValue: [],
    parse: (value) => value.split(",").filter(Boolean),
    serialize: (value) => value.join(","),
  });

  const [selectedOptionsByType, setSelectedOptionsByType] = useQueryState(
    "optionsByType",
    {
      defaultValue: {},
      parse: (value) => {
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      },
      serialize: (value) => JSON.stringify(value),
    }
  );

  const [options, setOptions] = useState<Option[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Fetch product data from REST API
  useEffect(() => {
    const fetchProduct = async () => {
      setProductLoading(true);
      setProductError(null);
      try {
        console.log("Fetching product with ID:", productId);

        // Use different endpoints for development vs production
        const isDevelopment = import.meta.env.DEV;
        const productUrl = isDevelopment
          ? `/products-api/products/v1?ids=${productId}`
          : `/.netlify/functions/products?productId=${productId}`;

        const { data } = await axios.get<Product[]>(productUrl, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: false,
        });

        const product = data?.[0];

        if (product) {
          setProduct(product);
        } else {
          setProductError("No product found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        if (axios.isAxiosError(error)) {
          console.error("Axios error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            data: error.response?.data,
          });
          if (error.code === "ERR_NETWORK" || error.message.includes("CORS")) {
            setProductError(
              "CORS error: API not accessible from browser. Please check API configuration."
            );
          } else {
            setProductError(
              `Failed to load product: ${error.response?.status} ${error.response?.statusText}`
            );
          }
        } else {
          setProductError("Failed to load product");
        }
      } finally {
        setProductLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const fetchOptions = async (selectedOptionIds: string) => {
    setOptionsLoading(true);
    try {
      // Use different endpoints for development vs production
      const isDevelopment = import.meta.env.DEV;
      const optionsUrl = isDevelopment
        ? `/api/ng-all-options?productId=${productId}&selectedOptions=${selectedOptionIds}`
        : `/.netlify/functions/options?productId=${productId}&selectedOptions=${selectedOptionIds}`;

      const response = await axios.get<ApiResponse>(optionsUrl, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: false,
      });

      // Extract options from the nested response structure
      const allOptions: Option[] = [];
      const buckets =
        response.data?.options_detail?.aggregations?.by_type?.buckets || [];

      buckets?.forEach((bucket) => {
        const bucketOptions = bucket?.options?.hits?.hits || [];
        bucketOptions?.forEach((hit) => {
          if (hit?.status !== "unavailable") {
            allOptions.push(hit._source);
          }
        });
      });

      const hits = response.data?.sku_response?.hits?.hits;

      if (hits?.length <= 3) {
        setSku(hits[0]?._source?.id);
      }

      setOptions(allOptions);
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setOptionsLoading(false);
    }
  };

  // Fetch options from the API
  const selectedOptions = Object.values(selectedOptionsByType).join(",");
  useEffect(() => {
    fetchOptions(selectedOptions);
  }, [selectedOptions]);

  useEffect(() => {
    console.log("selectedOptionIds", selectedOptionIds);
  }, [selectedOptionIds]);

  const handleDropdownChange = (optionType: string, optionId: string) => {
    const newSelectedOptions = {
      ...selectedOptionsByType,
      [optionType]: optionId,
    };
    setSelectedOptionsByType(newSelectedOptions);

    // Update the selectedOptionIds array for backward compatibility
    const allSelectedIds = Object.values(newSelectedOptions).filter(
      Boolean
    ) as string[];
    setSelectedOptionIds(allSelectedIds);
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-12 h-12 border-2 border-gray-300 -black rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-light text-lg font-body">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-lg">
          <h2 className="text-3xl font-light text-gray-900 font-display">
            Product Unavailable
          </h2>
          <p className="text-gray-600 font-light text-lg leading-relaxed font-body">
            {productError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors font-body"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-lg">
          <h2 className="text-3xl font-light text-gray-900 font-display">
            Product Not Found
          </h2>
          <p className="text-gray-600 font-light text-lg leading-relaxed font-body">
            The requested product could not be located.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Product Details Section - RH Style */}
          <div className="flex  items-start justify-center p-8 lg:p-16 space-y-12 gap-10">
            {/* Product Title */}
            <img
              className="aspect-square object-contain shrink-0 w-96"
              src={product.imageUrl}
              alt={product.displayName}
            />
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-light text-gray-900 leading-tight tracking-wide font-display mb-10">
                {product.displayName}
              </h1>
              {/* Product Options */}
              <div className="space-y-8">
                <div className="space-y-8">
                  {/* Group options by type */}
                  {(() => {
                    const groupedOptions = options.reduce((acc, option) => {
                      const type = option.option_type_name_s;
                      if (!acc[type]) {
                        acc[type] = [];
                      }
                      acc[type].push(option);
                      return acc;
                    }, {} as Record<string, Option[]>);

                    return (
                      <div className="space-y-8 flex gap-8 flex-wrap">
                        {Object.entries(groupedOptions).map(
                          ([type, typeOptions]) => (
                            <div key={type} className="space-y-4">
                              <label className="text-lg font-medium text-gray-900 capitalize tracking-wide font-body">
                                {type}
                              </label>
                              <select
                                value={selectedOptionsByType[type] || ""}
                                onChange={(e) =>
                                  handleDropdownChange(type, e.target.value)
                                }
                                className="w-full px-0 py-3 bg-transparent border-b border-gray-300 text-gray-900 font-light focus:border-black focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
                                disabled={optionsLoading}
                              >
                                <option value="">Select {type}</option>
                                {typeOptions.map((option) => (
                                  <option
                                    key={option.option_id_s}
                                    value={option.option_id_s}
                                  >
                                    {option.option_value_s}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* SKU Display */}
              {sku && (
                <div className="space-y-4 pt-8  border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 font-body">
                    SKU: {sku}
                  </h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
