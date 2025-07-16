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
}

function App() {
  const [productId] = useQueryState("productId", {
    defaultValue: "prod34521304",
  });

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
  const [optionsError, setOptionsError] = useState<string | null>(null);

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
        const { data } = await axios.get<Product[]>(
          `/products-api/products/v1?ids=${productId}`
        );

        console.log("Product API response:", data);
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
          setProductError(
            `Failed to load product: ${error.response?.status} ${error.response?.statusText}`
          );
        } else {
          setProductError("Failed to load product");
        }
      } finally {
        setProductLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Fetch options from the API
  useEffect(() => {
    const fetchOptions = async () => {
      setOptionsLoading(true);
      setOptionsError(null);
      try {
        const response = await axios.get<ApiResponse>(
          `/api/ng-all-options?productId=${productId}`
        );

        // Extract options from the nested response structure
        const allOptions: Option[] = [];
        const buckets =
          response.data?.options_detail?.aggregations?.by_type?.buckets || [];

        buckets.forEach((bucket) => {
          const bucketOptions = bucket.options?.hits?.hits || [];
          bucketOptions.forEach((hit) => {
            if (hit._source) {
              allOptions.push(hit._source);
            }
          });
        });

        setOptions(allOptions);
      } catch (error) {
        console.error("Error fetching options:", error);
        setOptionsError("Failed to load options");
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, [productId]);

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

  if (productLoading) return <div>Loading product...</div>;
  if (productError) return <div>Error: {productError}</div>;

  if (!product) {
    return <div>No product found</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <img
          src={product.imageUrl}
          alt={product.displayName}
          style={{ width: "200px", height: "200px" }}
        />
        <span>{product.displayName}</span>

        {/* Options Dropdown */}
        <div style={{ marginTop: "20px" }}>
          <h3>Product Options</h3>
          {optionsLoading && <div>Loading options...</div>}
          {optionsError && <div style={{ color: "red" }}>{optionsError}</div>}
          {!optionsLoading && !optionsError && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
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

                return Object.entries(groupedOptions).map(
                  ([type, typeOptions]) => (
                    <div
                      key={type}
                      style={{
                        border: "1px solid #ddd",
                        padding: "15px",
                        borderRadius: "8px",
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
                        {type}
                      </h4>
                      <select
                        value={selectedOptionsByType[type] || ""}
                        onChange={(e) =>
                          handleDropdownChange(type, e.target.value)
                        }
                        style={{
                          padding: "8px 12px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          fontSize: "14px",
                          minWidth: "200px",
                        }}
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
                );
              })()}
            </div>
          )}

          {selectedOptionIds.length > 0 && (
            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
              }}
            >
              <strong>Selected Options:</strong> {selectedOptionIds.join(", ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
