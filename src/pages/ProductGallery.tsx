import React, { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { GET_PRODUCT_IMAGE } from "../graphql/queries";
import "./ProductGallery.css";

interface Hit {
  _id: string;
  _source: {
    product_name_s: string;
    product_id_s: string;
    image_url_s?: string;
    image_urls_ss?: string[];
    images_ss?: string[];
    // other fields can be added as needed
  };
}

const API_URL = "https://rbmsoft-search.sigmie.com/api/search";
const TOKEN = "2|QMEo8Og6JRgqXpqjFwx82QxPEEXeXl7tkxvQqZ4ad880fdf9";

const NavBar: React.FC<{ search: string; setSearch: (s: string) => void }> = ({
  search,
  setSearch,
}) => {
  const [input, setInput] = React.useState(search);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearch(input);
    }
  };
  return (
    <header className="main-nav">
      <div className="main-nav-content">
        <div className="search-bar-container">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="search-icon"
          >
            <circle
              cx="11.5"
              cy="9.88"
              r="7.18"
              stroke="currentColor"
              strokeWidth="0.75"
            />
            <line
              x1="16.57"
              y1="15.11"
              x2="21.92"
              y2="20.46"
              stroke="currentColor"
              strokeWidth="0.75"
            />
          </svg>
          <input
            className="search-bar-input"
            type="text"
            placeholder="Search..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="nav-logo">RBMSoft</div>
      </div>
    </header>
  );
};

const ProductGrid: React.FC<{ search: string }> = ({ search }) => {
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const itemsPerPage = 12; // Increased from 5 to 12 for better UX

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          query: search,
          per_page: itemsPerPage.toString(),
          filters: "",
          facets: "brand_ss:50 sku_material_s:50",
          page: currentPage.toString(),
          sort: "_score",
        });
        const urlWithParams = `${API_URL}?${queryParams.toString()}`;
        const response = await fetch(urlWithParams, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({}),
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setHits(data.hits || []);

        // Calculate total pages based on total hits
        const total = data.total || 0;
        setTotalHits(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );

    // First page if not visible
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span
            key="ellipsis1"
            className="px-3 py-2 text-sm text-gray-500 bg-white border-t border-b border-gray-300"
          >
            ...
          </span>
        );
      }
    }

    // Visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-300 ${
            i === currentPage
              ? "bg-black text-white"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page if not visible
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="ellipsis2"
            className="px-3 py-2 text-sm text-gray-500 bg-white border-t border-b border-gray-300"
          >
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );

    return pages;
  };

  return (
    <div className="App">
      <h1>Product Grid</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Results info */}
      {!loading && !error && (
        <div className="results-info mb-4">
          <p className="text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalHits)} of {totalHits}{" "}
            results
          </p>
        </div>
      )}

      <div className="product-grid">
        {hits.map((hit) => (
          <ProductGridItem key={hit._id} hit={hit} />
        ))}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="pagination-container mt-8">
          <nav className="flex justify-center">
            <div className="flex">{renderPagination()}</div>
          </nav>
        </div>
      )}
    </div>
  );
};

// New component for each product item to handle async image fetching
const ProductGridItem: React.FC<{ hit: Hit }> = ({ hit }) => {
  const [imgUrl, setImgUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [getProductImage] = useLazyQuery(GET_PRODUCT_IMAGE, {
    onCompleted: (data) => {
      const imageUrl = data?.productImage?.imageUrl;
      if (imageUrl) {
        let url = imageUrl;
        if (url.startsWith("//")) url = "https:" + url;
        setImgUrl(url);
      } else {
        setImgUrl(null);
      }
      setLoading(false);
    },
    onError: () => {
      setImgUrl(null);
      setLoading(false);
    },
  });

  React.useEffect(() => {
    if (!hit._source.product_id_s) return;

    setLoading(true);
    getProductImage({
      variables: {
        productId: hit._source.product_id_s,
        siteId: "RH",
        locale: "en-US",
        selectedOptionIds: [],
      },
    });
  }, [hit._source.product_id_s, getProductImage]);

  return (
    <Link
      to={`/products?productId=${hit._source.product_id_s}`}
      className="product-item"
      style={{ textDecoration: "none", color: "inherit" }}
      onClick={(e) => {
        if (loading) {
          e.preventDefault();
        }
      }}
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={hit._source.product_name_s}
          className="product-image"
          style={{
            width: 200,
            height: 200,
            objectFit: "contain",
            borderRadius: 4,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="placeholder-image" />
      )}
      <div className="product-title">{hit._source.product_name_s}</div>
    </Link>
  );
};

const ProductGallery: React.FC = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="bg-white">
      <NavBar search={search} setSearch={setSearch} />
      <div style={{ marginTop: 90 }}>
        <ProductGrid search={search} />
      </div>
    </div>
  );
};

export default ProductGallery;
