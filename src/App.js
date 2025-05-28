import React, { useState, useEffect } from "react";
import { UploadCloud, TrendingUp, CalendarClock, FileDown, Info, CalendarRange } from "lucide-react";
import * as XLSX from "xlsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const dummyGraphData = [
  { date: "2025-05-21", rank: 45 },
  { date: "2025-05-22", rank: 38 },
  { date: "2025-05-23", rank: 20 },
  { date: "2025-05-24", rank: 10 },
  { date: "2025-05-25", rank: 5 },
];

export default function LookpinRankAnalyzer() {
  const [showHelp, setShowHelp] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showGraph, setShowGraph] = useState(false);
  const [formattedRows, setFormattedRows] = useState([]);

  const handleCustomRangeAnalysis = () => {
    console.log("기간 분석 실행됨: ", dateRange);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(formattedRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "랭킹 데이터");
    XLSX.writeFile(wb, "lookpin_ranking.xlsx");
  };

  const handleRankSurge = () => {
    console.log("급상승 분석 실행됨");
  };

  const handleRecentSurge = () => {
    console.log("일주일 분석 실행됨");
  };

  const autoFormatTextData = (rawText) => {
    const lines = rawText.split("\n").map(line => line.trim()).filter(Boolean);
    const rows = [];
    let i = 0;
    let rank = 1;

    while (i < lines.length - 5) {
      const discount = /%$/.test(lines[i]) ? lines[i] : "";
      const priceLine = lines[i + 1];
      const priceMatch = priceLine.match(/(\d{1,3}(,\d{3})*)/);
      const price = priceMatch ? priceMatch[0].replace(/,/g, "") : "";

      let j = i + 2;
      let productName = "";
      while (j < lines.length && !/^\d+(\.\d+)?$/.test(lines[j])) {
        productName += (productName ? " " : "") + lines[j];
        j++;
      }

      const rating = lines[j];
      const review = lines[j + 1];
      const shippingLine = lines[j + 2] || "";
      const shipping = shippingLine.includes("배송우수") ? "O" : "X";

      rows.push({
        순위: rank++,
        할인율: discount,
        판매가: price,
        상품명: productName,
        평점: rating,
        리뷰수: review,
        배송우수: shipping
      });

      i = shipping === "O" ? j + 3 : j + 2;
    }
    return rows;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="text-center flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">LOOKPIN 인기상품 분석</h1>
          <p className="text-sm text-gray-500">파일 업로드 후 랭킹 분석, 급상승 상품 감지까지 자동으로!</p>
        </div>
        <button onClick={() => setShowHelp(true)} className="text-sm text-blue-600 underline flex items-center gap-1">
          <Info className="w-4 h-4" /> 도움말 보기
        </button>
      </div>

      {showHelp && (
        <div className="border p-4 bg-blue-50 rounded text-sm">
          <h2 className="font-semibold mb-2">📘 기능 요약</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>파일 업로드 시 자동으로 날짜별 랭킹 데이터가 누적됩니다.</li>
            <li>상품을 클릭하면 날짜별 순위 변화를 그래프로 확인할 수 있습니다.</li>
            <li>급상승 상품: 100위권 외 → 100위권 진입 or 랭킹 10위 이상 상승</li>
            <li>일주일 분석: 리뷰 10~200개, 평점 4.9 이상, 배송우수 상품 중 선정</li>
            <li>기간 분석: 시작일 ~ 종료일 선택 후 급상승 상품 탐색</li>
            <li>엑셀 다운로드: 현재 화면에 보이는 랭킹 표를 저장합니다</li>
            <li>자동 정리: 업체명+상품명이 붙어 있는 경우 자동으로 줄맞춤 정리</li>
          </ul>
          <div className="text-right mt-2">
            <button onClick={() => setShowHelp(false)} className="text-blue-600 underline">닫기</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <button onClick={() => document.getElementById("uploadInput").click()} className="bg-black text-white px-4 py-2 rounded-md flex items-center justify-center gap-2">
          <UploadCloud className="w-4 h-4" /> 파일 업로드
        </button>
        <button onClick={handleRankSurge} className="bg-gray-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4" /> 급상승 상품
        </button>
        <button onClick={handleRecentSurge} className="bg-gray-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2">
          <CalendarClock className="w-4 h-4" /> 일주일 분석
        </button>
        <div className="flex gap-1 col-span-2">
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="border px-2 py-1 rounded w-full" />
          <button onClick={handleCustomRangeAnalysis} className="bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1">
            <CalendarRange className="w-4 h-4" /> 기간 분석
          </button>
        </div>
        <button onClick={handleExportExcel} className="bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2">
          <FileDown className="w-4 h-4" /> 엑셀 저장
        </button>
      </div>

      <input
        id="uploadInput"
        type="file"
        accept=".txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const rawText = event.target.result;
              const rows = autoFormatTextData(rawText);
              console.log("✅ 자동 정리 후 표로 변환된 데이터:", rows);
              setFormattedRows(rows);
            };
            reader.readAsText(file, "utf-8");
          }
        }}
      />

      {formattedRows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border mt-4 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">순위</th>
                <th className="border px-2 py-1">할인율</th>
                <th className="border px-2 py-1">판매가</th>
                <th className="border px-2 py-1">상품명</th>
                <th className="border px-2 py-1">평점</th>
                <th className="border px-2 py-1">리뷰수</th>
                <th className="border px-2 py-1">배송우수</th>
              </tr>
            </thead>
            <tbody>
              {formattedRows.map((row, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 text-center">{row["순위"]}</td>
                  <td className="border px-2 py-1 text-center">{row["할인율"]}</td>
                  <td className="border px-2 py-1 text-center">{row["판매가"]}</td>
                  <td className="border px-2 py-1">{row["상품명"]}</td>
                  <td className="border px-2 py-1 text-center">{row["평점"]}</td>
                  <td className="border px-2 py-1 text-center">{row["리뷰수"]}</td>
                  <td className="border px-2 py-1 text-center">{row["배송우수"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-right">
        <button onClick={() => setShowGraph(!showGraph)} className="text-sm text-blue-600 underline">{showGraph ? "그래프 숨기기" : "예시 그래프 보기"}</button>
      </div>

      {showGraph && (
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-4">상품 순위 변화 예시</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dummyGraphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis reversed domain={[100, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rank" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
