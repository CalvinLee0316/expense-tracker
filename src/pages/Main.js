import "../App.css";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import * as echarts from "echarts";
import ReactEcharts from "echarts-for-react";
import { BeatLoader } from "react-spinners";
// import { ClerkProvider } from "@clerk/clerk-react";
import { UserButton, useUser } from "@clerk/clerk-react";
function Main() {
  const loading = false;
  const loadingTime = 500;
  //spending states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [date, setDate] = useState("");
  const [dateNum, setDateNum] = useState(0);
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("All");
  const [transactions, setTransactions] = useState([]);
  const [num, setNum] = useState(0);
  const [month, setMonth] = useState(getCurrentYearMonth);

  const [edit, setEdit] = useState(false);
  const [editId, setEditId] = useState("");

  const { user } = useUser();
  const { getToken } = useAuth();

  //analytics states
  const [analyticsMonth, setAnalyticsMonth] = useState(getCurrentYearMonth);
  // const [pieTransactions, setPieTransactions] = useState([]);
  const [pieOption, setPieOption] = useState({});
  const [lineOption, setLineOption] = useState({});

  useEffect(() => {
    getTransactions(filter, month).then((t) => {
      setTransactions(t.toSorted(compare));
    });
  }, [num, filter, month]);

  useEffect(() => {
    getTransactions("All", analyticsMonth).then((ts) => {
      let pieData = {};
      ts.forEach((transaction) => {
        if(transaction.category != "Income") {
          if (pieData[transaction.category]) {
            pieData[transaction.category] += parseFloat(transaction.price);
          } else {
            pieData[transaction.category] = parseFloat(transaction.price);
          }
        }
      });

      let pieOption = {
        stillShowZeroSum: false,
        title: {
          text: "Spending Per Category",
          textStyle: {
            color: "white",
          },
          left: 20,
        },
        textStyle: {
          color: "black",
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)",
        },
        legend: {
          show: false,
          orient: "vertical",
          left: 40,
          textStyle: { color: "white" },
          top: "middle",
        },
        series: [
          {
            name: "Category",
            type: "pie",
            radius: "70%",
            center: ["50%", "50%"],
            data: Object.keys(pieData).map((key) => {
              return { value: pieData[key], name: key };
            }),
            label: {
              color: "white",
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
      setPieOption(pieOption);
    });
  }, [transactions, analyticsMonth]);

  function subtractMonth(yyyymm) {
    let year = parseFloat(yyyymm.substring(0, 4));
    let month = parseFloat(yyyymm.substring(4, 6));
    if (month === 1) {
      year--;
      month = 12;
    } else {
      month--;
    }
    return String(year) + String(month).padStart(2, "0");
  }

  useEffect(() => {
    //line graph options
    getYearsTransactions().then((ts) => {
      let lineData = {};
      ts.forEach((transaction) => {
        if (transaction.category != "Income") {
          const date = parseFloat(
            transaction.date.substring(0, 7).replace("-", "")
          );
          if (lineData[date]) {
            lineData[date] += parseFloat(transaction.price);
          } else {
            lineData[date] = parseFloat(transaction.price);
          }
        }
      });
      const now = parseFloat(getCurrentYearMonth().replace("-", ""));
      for (let i = now; i > now - 100; i = parseFloat(subtractMonth(String(i)))) {
        if (!lineData[i]) {
          lineData[i] = 0;
        }
      }
      let lineOption = {
        title: {
          text: "Spending Trend Over Year",
          textStyle: {
            color: "white",
          },
          left: 20,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985",
            },
          },
        },
        xAxis: {
          type: "category",
          data: Object.keys(lineData),
          axisLabel: {
            color: "white",
            interval: 0,
          },
          name: "Date YYYYMM",
          nameLocation: "middle",
          nameGap: "40",
          nameTextStyle: {
            color: "white",
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "white",
          },
          name: "Spending ($)",
          nameLocation: "middle",
          nameGap: "40",
          nameTextStyle: {
            color: "white",
          },
        },
        series: [
          {
            data: Object.keys(lineData).map((key) => {
              return lineData[key];
            }),
            type: "line",
          },
        ],
      };
      console.log(lineData)
      setLineOption(lineOption);
    });
  }, [transactions, num]);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  function getCurrentYearMonth() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1

    return `${year}-${month}`;
  }

  function convertDateStringToNumber(dateString) {
    // Split the date string into parts
    const [year, month, day] = dateString.split("-");

    // Concatenate the parts into a single string
    const yyyymmddString = `${year}${month}${day}`;

    // Convert the string to a number
    const yyyymmddNumber = Number(yyyymmddString);

    return yyyymmddNumber;
  }

  async function getYearsTransactions() {
    const month = getCurrentYearMonth().replace("-", "") + "00";
    const url =
      process.env.REACT_APP_API_URL + "/getTransactions/range/" + month;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
    });
    const json = await res.json();
    await delay(loadingTime);
    return json;
  }

  async function getTransactions(f, m) {
    let url = "";
    if (f === "All") {
      if (m === "") {
        // let month=getCurrentYearMonth()
        url = process.env.REACT_APP_API_URL + "/getTransactions/date/:" + month;
      } else {
        url = process.env.REACT_APP_API_URL + "/getTransactions/date/:" + m;
      }
    } else {
      if (m === "") {
        url =
          process.env.REACT_APP_API_URL +
          "/getTransactions/category/:" +
          f.replace(" ", "&");
      } else {
        url =
          process.env.REACT_APP_API_URL +
          "/getTransactions/:" +
          f.replace(" ", "&") +
          "/" +
          m;
      }
    }
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
    });
    const json = await res.json();
    await delay(loadingTime);
    return json;
  }

  async function addTransaction(ev) {
    ev.preventDefault();
    let re = /^\d+(?:[.]\d\d)$/;
    if (!re.test(price)) {
      alert("Please enter a valid price");
      return;
    }
    const url = process.env.REACT_APP_API_URL + "/addTransaction";
    const data = { name, price, category, date, dateNum, description };
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify(data),
    });
    setName("");
    setDate("");
    setDateNum(0);
    setDescription("");
    setPrice("");
    setNum(num + 1);
    setCategory("Groceries");
  }

  async function editTransaction(ev) {
    ev.preventDefault();
    let re = /^\d+(?:[.]\d\d)$/;
    if (!re.test(price)) {
      alert("Please enter a valid price");
      return;
    }
    const url = process.env.REACT_APP_API_URL + "/editTransaction/" + editId;
    const data = { name, price, category, date, dateNum, description };
    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify(data),
    });
    setName("");
    setDate("");
    setDateNum(0);
    setDescription("");
    setPrice("");
    setNum(num + 1);
    setEdit(false);
    setCategory("Groceries");
    await delay(loadingTime);
  }

  async function handleDelete(index, e) {
    const shouldRemove = window.confirm(
      "Are you sure you want to delete this transaction?"
    );
    if (shouldRemove) {
      const url =
        process.env.REACT_APP_API_URL +
        "/deleteTransaction/" +
        transactions[index]._id;
      fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      setNum(num + 1);
      await delay(loadingTime);
    }
  }

  async function handleDeleteAll(e) {
    const shouldRemove = window.confirm(
      "Are you sure you want to delete ALL transactions on your account?"
    );
    if (shouldRemove) {
      const url = process.env.REACT_APP_API_URL + "/deleteAllTransaction";
      fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      setNum(num + 1);
      await delay(loadingTime);
    }
  }

  function compare(a, b) {
    if (a.dateNum >= b.dateNum) {
      return -1;
    } else {
      return 1;
    }
  }

  let balance = 0;

  transactions.forEach((transaction) => {
    if (transaction.category == "Income") {
      balance += parseFloat(transaction.price)
    } else {
      balance -= parseFloat(transaction.price);
    }

  });

  balance = balance.toFixed(2);
  const fraction = balance.substring(balance.length - 3, balance.length);
  const whole = balance.substring(0, balance.length - 3);

  return loading ? (
    <main>
      {" "}
      <div class="loader">
        <BeatLoader color="red" />
      </div>{" "}
    </main>
  ) : (
    <main>
      <div class="float-child">
        <UserButton />
      </div>
      <div class="mainTracker">
        <h1>Welcome {user.firstName}!</h1>
        <h1 class="spendDate"> Spending for {month}: </h1>
        <h1>
          ${whole}
          {fraction}
        </h1>
        <div class="delete-all">
          <button
            class="delete-all-btn"
            onClick={(e) => {
              handleDeleteAll();
            }}
          >
            Delete All Transactions
          </button>
        </div>
        <form onSubmit={edit ? editTransaction : addTransaction}>
          <div class="basics">
            <input
              autocomplete="off"
              type="number"
              required
              name="price"
              placeholder={"100.00"}
              onChange={(ev) => setPrice(ev.target.value)}
              value={price}
            ></input>
            <input
              autocomplete="off"
              type="text"
              name="name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              required
              placeholder={"ShabuWorks"}
            ></input>
          </div>
          <div class="category-date">
            <select
              id="categories"
              name="categories"
              onChange={(ev) => setCategory(ev.target.value)}
            >
              <option value="Groceries">Groceries</option>
              <option value="Eating Out">Eating Out</option>
              <option value="Extras">Extras</option>
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Transportation">Transportation</option>
              <option value="Insurance">Insurance</option>
              <option value="Income">Income</option>
            </select>
            <input
              autocomplete="off"
              type="date"
              placeholder={"mm/dd/yyyy"}
              value={date}
              required
              onChange={(ev) => {
                setDate(ev.target.value);
                setDateNum(convertDateStringToNumber(ev.target.value));
              }}
              name="date"
            ></input>
          </div>
          <div class="description">
            <input
              autocomplete="off"
              type="text"
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              name="desc"
              placeholder={"Birthday celebration"}
            ></input>
          </div>
          {edit ? (
            <div style={{ display: "flex", gap: "5px" }}>
              <button
                onClick={() => {
                  setEdit(false);
                  setName("");
                  setDate("");
                  setDateNum(0);
                  setDescription("");
                  setPrice("");
                  setCategory("Groceries");
                }}
              >
                Cancel Edit
              </button>
              <button type="submit">Edit Transaction</button>
            </div>
          ) : (
            <button type="submit">Add New Transaction</button>
          )}
          {/* <button type="submit">
            {edit ? "Edit " : "Add New "}Transaction
          </button> */}
        </form>

        <div class="filter">
          <select
            id="filter"
            name="filter"
            onChange={(ev) => setFilter(ev.target.value)}
          >
            <option value="All">All</option>
            <option value="Groceries">Groceries</option>
            <option value="Eating Out">Eating Out</option>
            <option value="Extras">Extras</option>
            <option value="Rent">Rent</option>
            <option value="Utilities">Utilities</option>
            <option value="Transportation">Transportation</option>
            <option value="Insurance">Insurance</option>
            <option value="Income">Income</option>
          </select>

          <input
            type="month"
            id="month"
            value={month}
            onChange={(ev) => setMonth(ev.target.value)}
            name="month"
          ></input>
        </div>

        <div class="transactions">
          {transactions.length > 0 &&
            transactions.map((transaction, index) => (
              <div class="transaction">
                <div class="left">
                  <div class="name">{transaction.name}</div>
                  <div class="description">{transaction.description}</div>
                </div>
                <div class="category">{transaction.category}</div>
                <div class="middle">
                  {transaction.category == "Income" ? (
                    <div class="income">${transaction.price}</div>
                  ) : (
                    <div class="price">${transaction.price}</div>
                  )}
                  <div class="date">{transaction.date}</div>
                </div>
                <div class="right">
                  <button
                    class="edit-btn"
                    onClick={(e) => {
                      setEdit(true);
                      setEditId(transactions[index]._id);
                      setPrice(transaction.price);
                      setName(transaction.name);
                      setCategory(transaction.category);
                      setDate(transaction.date);
                      setDateNum(transaction.dateNum);
                      setDescription(transaction.description);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    class="delete-btn"
                    onClick={(e) => handleDelete(index, e)}
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div class="analytics">
        <h1>Analytics</h1>
        <div class="pie">
          <input
            type="month"
            class=""
            id="analyticsMonth"
            value={analyticsMonth}
            onChange={(ev) => {
              if (ev.target.value === "") {
                setAnalyticsMonth(getCurrentYearMonth());
              } else {
                setAnalyticsMonth(ev.target.value);
              }
            }}
            name="analyticsMonth"
          ></input>

          <ReactEcharts option={pieOption} />
        </div>
        <div class="line">
          <ReactEcharts option={lineOption} />
        </div>
      </div>
    </main>
  );
}

export default Main;
