import { useEffect, useState } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import countriesJson from "./countries.json";
import "./App.css";
import TopPage from "./pages/TopPage";
import WorldPage from "./pages/WorldPage";
import { CountryDataType, AllCountriesDataTypeArray } from "./types";

function App() {
  // 通信中か否かを判別する(通信中=true、通信中ではない=false)
  const [loading, setLoading] = useState<boolean>(false);

  // 選択された国のslugをcountryに保存
  const [country, setCountry] = useState<string>("japan");

  // 受け取った感染データをアプリ内で保管
  const [countryData, setCountryData] = useState<CountryDataType>({
    date: "", // 日付
    newConfirmed: 0, // 新規感染者
    totalConfirmed: 0, // 感染者総数
    newRecovered: 0, // 新規回復者
    totalRecovered: 0, // 回復者総数
  });

  // 世界各国の感染データをstateで保管
  const [allCountriesData, setAllCountriesData] =
    useState<AllCountriesDataTypeArray>([
      {
        Country: "",
        NewConfirmed: 0,
        TotalConfirmed: 0,
      },
    ]); // 書き込むデータの種類が配列なので[]とする

  // 国名の選択だけでデータを表示
  useEffect(() => {
    // 選択された国の感染データを取得
    const getCountryData = () => {
      setLoading(true);
      fetch(
        `https://proxy-server-book.vercel.app/corona-tracker-country-data?${country}`
      )
        .then((res) => res.json())
        .then((data) => {
          setCountryData({
            date: data[data.length - 1].Date,
            newConfirmed:
              data[data.length - 1].Confirmed - data[data.length - 2].Confirmed, // 新規感染者 = 今日の感染者 - 昨日の感染者
            totalConfirmed: data[data.length - 1].Confirmed,
            newRecovered:
              data[data.length - 1].Recovered - data[data.length - 2].Recovered, // 新規回復者 = 今日の回復者 - 昨日の回復者
            totalRecovered: data[data.length - 1].Recovered,
          });
          setLoading(false);
        })
        .catch((err) =>
          alert(
            "エラーが発生しました。ページをリロードして、もう一度トライしてください。"
          )
        );
    };
    getCountryData(); // ボタンを押すなどの操作がなくても自ら「getCountryData」を実行
  }, [country]); // ユーザーが国名を変える（「country」stateが変更される）のに合わせてuseEffectを実行

  // WorldPageコンポーネントが表示された時に「getAllCountriesData」を実行
  useEffect(() => {
    // 世界各国の感染データを取得
    fetch("https://proxy-server-book.vercel.app/corona-tracker-world-data")
      .then((res) => res.json())
      .then((data) => setAllCountriesData(data.Countries))
      .catch((err) =>
        alert(
          "エラーが発生しました。ページをリロードして、もう一度トライしてください。"
        )
      );
  }, []); // 第二引数に[]をつけることでレンダリングされたときのみ実行

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <TopPage
              countriesJson={countriesJson}
              setCountry={setCountry}
              countryData={countryData}
              loading={loading}
            />
          }
        />
        <Route
          path="/world"
          element={<WorldPage allCountriesData={allCountriesData} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
