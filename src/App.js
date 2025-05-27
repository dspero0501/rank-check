import React, { useState } from "react";
import { UploadCloud, TrendingUp, CalendarClock, FileDown } from "lucide-react";
import * as XLSX from "xlsx";

export default function LookpinRankAnalyzer() {
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [viewMode, setViewMode] = useState("all");

  const previousRanks = {
    "룩미보이[SET할인] 논페이드 데님 생지 오버핏 셔츠 반바지 셋업 흑청 진청": 35,
    "180도샵[당일출고][1+1할인] 오버핏 쿨 그래피티 프린팅 안비치는 반팔티 흰티 검정티 M~2XL": 5,
    "빛날[M-4XL][당일발송]빅사이즈 가오리 라운드 7부 반팔티": 105
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

    let i = 0;
    let rank = 1;
    const entries = [];

    while (i < lines.length - 4 && rank <= 100) {
      if (/\d+%/.test(lines[i]) || lines[i] === "%") {
        try {
          const price = parseInt(lines[i + 1].replace(/[^\d]/g, ""));
          const productLine = lines[i + 2];
          const brandMatch = productLine.match(/^([^\[]+)/);
          const brand = brandMatch ? brandMatch[1].trim() : "";
          const productName = productLine.trim();
          const rating = parseFloat(lines[i + 3]);
          const reviewMatch = lines[i + 4].match(/\((\d+[+,"]*)\)/);
          let reviewCount = reviewMatch ? reviewMatch[1].replace(",", "") : "0";
          reviewCount = reviewCount.includes("+") ? 0 : parseInt(reviewCount);
          const deliveryFlag = lines[i + 5] && lines[i + 5].includes("배송우수") ? "O" : "X";

          entries.push({
            순위: rank,
            업체명: brand,
            상품명: productName,
            판매가: price,
            평점: rating,
            리뷰수: reviewCount,
            배송우수: deliveryFlag,
          });

          rank++;
          i += deliveryFlag === "O" ? 6 : 5;
        } catch {
          i++;
        }
      } else {
        i++;
      }
    }

    setData(entries);
    setOriginalData(entries);
    setViewMode("all");
  };

  const handleRankSurge = () => {
    const surged = originalData.filter((item) => {
      const previousRank = previousRanks[item.상품명];
      return previousRank === undefined || previousRank - item.순위 >= 10;
    });
    setData(surged);
    setViewMode("surge");
  };

  const handleRecentSurge = () => {
    const recent = originalData.filter(
      (item) => item.리뷰수 >= 10 && item.리뷰수 <= 200 && item.평점 >= 4.9 && item.배송우수 === "O"
    );
    setData(recent);
    setViewMode("recent");
  };

  const handleShowAll = () => {
    setData(originalData);
    setViewMode("all");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LOOKPIN_Rank");
    XLSX.writeFile(workbook, "lookpin_rank.xlsx");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">LOOKPIN 인기상품 분석</h1>
        <p className="text-sm text-gray-500">파일 업로드 후 랭킹 분석, 급상승 상품 감지까지 자동으로!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <button onClick={() => document.getElementById("uploadInput").click()} className="bg-black text-white px-4 py-2 rounded-md flex items-center justify-center gap-2">
          <UploadCloud className="w-4 h-4" /> 파일 업로드
        </button>
        <button onClick={handleRankSurge} className="bg-gray-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4" /> 급상승 상품
        </button>
        <button onClick={handleRecentSurge} className="bg-gray-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2">
          <CalendarClock className="w-4 h-4" /> 일주일 분석
        </button>
        <button onClick={handleShowAll} className="bg-gray-500 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2">
          전체 보기
        </button>
        <button onClick={handleExportExcel} className="bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2">
          <FileDown className="w-4 h-4" /> 엑셀 저장
        </button>
      </div>

      <input type="file" id="uploadInput" accept=".txt" className="hidden" onChange={handleFileUpload} />

      {fileName && <div className="text-sm mt-2 text-gray-600">✅ 업로드된 파일: {fileName}</div>}

      {data.length > 0 && (
        <div className="overflow-x-auto text-sm mt-6">
          <table className="table-auto border w-full">
            <thead>
              <tr className="bg-gray-100">
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="border px-2 py-1">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx} className="text-center">
                  {Object.values(item).map((val, i) => (
                    <td key={i} className="border px-2 py-1">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode !== "all" && (
        <div className="text-right text-sm text-blue-600 underline cursor-pointer mt-2" onClick={handleShowAll}>
          🔄 전체 랭킹 보기
        </div>
      )}
    </div>
  );
}