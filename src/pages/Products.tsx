import { useQueryState } from "nuqs";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import React from "react";

// Product interface is now defined by GraphQL schema

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

interface ProductData {
  is_bundle_product_i: number | null;
  option_id_ss: string[] | null;
  option_override_sequence_ss: string[];
  product_image_s: string;
  product_name_s: string;
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
  product_response: {
    hits: {
      hits: Array<{
        _source: ProductData;
      }>;
    };
  };
}

const Products: React.FC = () => {
  const [productId] = useQueryState("productId", {
    defaultValue: "prod34521304",
  });
  const [sku, setSku] = useState<string | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);

  console.log({ productId });

  const [selectedOptionIds, setSelectedOptionIds] = useQueryState("optionIds", {
    defaultValue: [],
    parse: (value) => value.split(",").filter(Boolean),
    serialize: (value) => {
      return value.filter(Boolean).join(",");
    },
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

  const fetchOptions = React.useCallback(
    async (selectedOptionIds: string) => {
      setOptionsLoading(true);
      try {
        // Use different endpoints for development vs production
        const optionsUrl = `/api/ng-all-options?productId=${productId}&selectedOptions=${selectedOptionIds}`;

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

        // Extract product data from product_response
        const productHits = response.data?.product_response?.hits?.hits;
        if (productHits && productHits.length > 0) {
          setProductData(productHits[0]._source);
        }

        setOptions(allOptions);
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setOptionsLoading(false);
      }
    },
    [productId]
  );

  // Fetch options from the API
  const selectedOptions = Object.values(selectedOptionsByType)
    .filter(Boolean)
    .join(",");

  useEffect(() => {
    fetchOptions(selectedOptions);
  }, [fetchOptions, selectedOptions]);

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

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto">
        <div>
          {/* Navigation */}
          <div className="p-8 lg:p-16 pb-0">
            <div className="flex items-center gap-4 mb-8">
              <Link
                to="/product-gallery"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 font-body"
              >
                ← Back to Product Gallery
              </Link>
            </div>
          </div>

          {/* Product Details Section - RH Style */}
          <div className="flex items-start justify-center p-8 lg:p-16 space-y-12 gap-10">
            {/* Product Title */}
            {productData?.product_image_s ? (
              <img
                className="aspect-square object-contain shrink-0 w-96"
                src={`https://media.restorationhardware.com/is/image/rhis/${productData.product_image_s}`}
                alt={productData.product_name_s}
              />
            ) : (
              <div className="aspect-square object-contain shrink-0 w-96 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
            )}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-light text-gray-900 leading-tight tracking-wide font-display mb-10">
                {productData?.product_name_s || "Product Options"}
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
                                <option value="">{`Select ${type}`}</option>
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
                <div className="space-y-4 pt-8 border-gray-200">
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
};

export default Products;
