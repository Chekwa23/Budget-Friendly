import React, { useEffect, useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { dbGet, dbSet } from "./database";
import { FaPlus, FaTrashAlt } from "react-icons/fa";

function App() {
  const [income, setIncome] = useState(0);
  const [billSum, setBillSum] = useState(0);
  const [takeHome, setTakeHome] = useState(0);

  const [billList, setBillList] = useState([]);

  const [edit, setEdit] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await dbGet("billList");
      const dataIncome = await dbGet("income");
      if (data) {
        setBillList(data);
      } else {
        await dbSet("billList", billList);
      }
      if (dataIncome) {
        setIncome(dataIncome);
      } else {
        await dbSet("income", income);
      }
    }
    fetchData();
  }, []);

  async function onSave() {
    setEdit(true);
    await dbSet("billList", billList);
    await dbSet("income", income);
  }

  async function onReset() {
    let copyBill = structuredClone(billList);
    copyBill.forEach((item) => {
      item.paid = false;
    });
    setBillList(copyBill);
    await dbSet("billList", copyBill);
  }

  async function addAndSave(newItem) {
    let newList = [...billList, newItem];
    setBillList(newList);
    await dbSet("billList", newList);
  }

  useEffect(() => {
    let temp = Number(0);
    billList.forEach((bill) => {
      temp += Number(bill.cost);
    });
    setBillSum(temp);
    setTakeHome(income - temp);
  }, [billList, income]);

  function sortList(listToSort) {
    return listToSort.sort((a, b) => {
      if (a.date === "" && b.date === "") {
        return 0; // Keep the order of empty strings as they are
      } else if (a.date === "") {
        return 1; // Place empty strings at the end
      } else if (b.date === "") {
        return -1; // Place empty strings at the end
      } else {
        return a.date.localeCompare(b.date); // Sort non-empty strings
      }
    });
  }

  return (
    <div className="bg-dark min-vh-100 px-2">
      <div className="fs-2 fw-bold text-light d-flex flex-row justify-content-center">
        $
        {edit ? (
          <span>{income}</span>
        ) : (
          <span>
            <Form.Control
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </span>
        )}{" "}
        - <span className="text-danger">${billSum}</span> ={" "}
        <span className={takeHome > 0 ? "text-success" : "text-danger"}>
          ${takeHome}
        </span>
      </div>
      <div className="my-3 d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={() => onReset()}>
          Reset
        </Button>
        {edit ? (
          <Button variant="outline-secondary" onClick={() => setEdit(false)}>
            Edit
          </Button>
        ) : (
          <Button variant="outline-secondary" onClick={() => onSave()}>
            Save
          </Button>
        )}
      </div>
      <div>
        {sortList(billList).map((item, index) => {
          return (
            <BillComponent
              key={index}
              index={index}
              item={item}
              updateBillList={setBillList}
              edit={edit}
            />
          );
        })}
        <BillComponentEmpty edit={false} addAndSave={addAndSave} />
      </div>
    </div>
  );
}

function BillComponent({ index, item, updateBillList, edit }) {
  const [bill, setBill] = useState(item?.bill);
  const [cost, setCost] = useState(item?.cost);
  const [date, setDate] = useState(item?.date);
  const [paid, setPaid] = useState(item?.paid);

  useEffect(() => {
    setBill(item?.bill);
    setCost(item?.cost);
    setDate(item?.date);
    setPaid(item?.paid);
  }, [item]);

  useEffect(() => {
    if (item) {
      updateBillList((prevState) => {
        let temp = structuredClone(prevState);
        temp[index] = { bill, cost, date, paid };
        return temp;
      });
    }
  }, [bill, cost, date, paid]);

  async function deleteAndSave() {
    updateBillList((prevState) => {
      let newList = structuredClone(prevState);
      newList.splice(index, 1);
      return newList;
    });
  }

  return (
    <InputGroup className="mb-3">
      <InputGroup.Checkbox
        aria-label="Checkbox for following text input"
        checked={paid}
        disabled={edit}
        onChange={(e) => setPaid(e.target.checked)}
      />
      {/* <InputGroup.Text>Bill</InputGroup.Text> */}
      <Form.Control
        aria-label="Bill"
        value={bill}
        disabled={edit}
        style={{ width: "70px" }}
        onChange={(e) => setBill(e.target.value)}
      />
      <InputGroup.Text>$</InputGroup.Text>
      <Form.Control
        aria-label="Cost"
        value={cost}
        disabled={edit}
        type="number"
        onChange={(e) => setCost(e.target.value)}
      />
      {/* <InputGroup.Text>Date</InputGroup.Text> */}
      <Form.Control
        aria-label="Date"
        value={date}
        disabled={edit}
        onChange={(e) => setDate(e.target.value)}
      />
      <Button variant="outline-danger" onClick={deleteAndSave} disabled={edit}>
        <FaTrashAlt />
      </Button>
    </InputGroup>
  );
}

function BillComponentEmpty({ addAndSave }) {
  const [bill, setBill] = useState("");
  const [cost, setCost] = useState(0);
  const [date, setDate] = useState("");
  const [paid, setPaid] = useState(false);

  function onAdd() {
    if (!(bill === "" || cost === "")) {
      addAndSave({ bill, cost, date, paid });
      setBill("");
      setCost(0);
      setDate("");
      setPaid(false);
    }
  }

  return (
    <InputGroup className="mb-3">
      <InputGroup.Checkbox
        aria-label="Checkbox for following text input"
        checked={paid}
        onChange={(e) => setPaid(e.target.checked)}
      />
      {/* <InputGroup.Text>Bill</InputGroup.Text> */}
      <Form.Control
        aria-label="Bill"
        value={bill}
        style={{ width: "70px" }}
        onChange={(e) => setBill(e.target.value)}
      />
      <InputGroup.Text>$</InputGroup.Text>
      <Form.Control
        aria-label="Cost"
        value={cost}
        type="number"
        onChange={(e) => setCost(e.target.value)}
      />
      {/* <InputGroup.Text>Date</InputGroup.Text> */}
      <Form.Control
        aria-label="Date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Button variant="outline-success" onClick={onAdd}>
        <FaPlus />
      </Button>
    </InputGroup>
  );
}

export default App;
