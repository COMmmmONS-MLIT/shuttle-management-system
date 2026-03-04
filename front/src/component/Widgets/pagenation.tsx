import React from "react";
import ReactPaginate from "react-paginate";

type Props = {
  totalPages: number;
  currentPage: number;
  all: number;
  setState: any;
  fetchFunc: any;
};

const pagenation = ({
  totalPages,
  currentPage,
  all,
  setState,
  fetchFunc,
}: Props) => {
  const handlePageClick = ({ selected }: { selected: number }) => {
    setState((prev: any) => {
      const updatedState = { ...prev, page: selected + 1 };
      fetchFunc(updatedState);
      return updatedState;
    });
  };
  return (
    <div>
      <div className="pagination">
        <h4>
          全<span>{all || 0}</span>件
        </h4>
        {/* データが0件の場合はReactPaginateをレンダリングしない */}
        {totalPages > 0 && (
          // @ts-ignore
          <ReactPaginate
            pageCount={totalPages} // 全部のページ数
            pageRangeDisplayed={3} // アクティブなページを基準にして、そこからいくつページ数を表示するか
            previousLabel={"戻る"}
            nextLabel={"次へ"}
            breakLabel={"..."}
            marginPagesDisplayed={2} // 一番最初と最後を基準にして、そこからいくつページ数を表示するか
            onPageChange={handlePageClick} // クリック時のfunction
            forcePage={Math.max(0, currentPage - 1)} // 現在のページ(reactnativeのスタートが０なので)
            pageClassName={"number"} // その他のliにつけるクラス名
            activeLinkClassName={"active"} // アクティブなページのaタグに着くクラス名
            breakClassName={"leader"} // 「...」のliにつけるクラス名
            previousClassName={"prev"} // 「<」のliに着けるクラス名
            nextClassName={"next"} // 「>」のliに着けるクラス名
          />
        )}
      </div>
    </div>
  );
};

export default pagenation;
