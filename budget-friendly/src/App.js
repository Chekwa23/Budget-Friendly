import React, { useEffect, useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { dbGet, dbSet } from "./database";
import {
  FaEquals,
  FaMinus,
  FaPiggyBank,
  FaPlus,
  FaTrashAlt,
} from "react-icons/fa";
import ConfettiExplosion from "react-confetti-explosion";

function App() {
  const [income, setIncome] = useState(0);
  const [billSum, setBillSum] = useState(0);
  const [takeHome, setTakeHome] = useState(0);
  const [afterPay, setAfterPay] = useState(0);
  const [billList, setBillList] = useState([]);
  const [edit, setEdit] = useState(true);
  const [isExploding, setIsExploding] = useState(false);

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
    billList.every((item) => item.paid) && setIsExploding(true);
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
    let sumingBill = Number(0);
    let sumingAfterPay = Number(0);
    billList.forEach((bill) => {
      sumingBill += Number(bill.cost);
      !bill.paid && (sumingAfterPay += Number(bill.cost));
    });
    setBillSum(sumingBill);
    setTakeHome(income - sumingBill);
    setAfterPay(sumingAfterPay);
  }, [billList, income]);

  function sortList(listToSort) {
    if (!edit) {
      return listToSort;
    }
    return listToSort.sort((a, b) => {
      let tempA = a.date.replace(/\D/g, "");
      let tempB = b.date.replace(/\D/g, "");

      if (tempA === "" && tempB === "") {
        return 0; // Keep the order of empty strings as they are
      } else if (tempA === "" || parseInt(tempA) > parseInt(tempB)) {
        return 1; // Place empty strings at the end
      } else if (tempB === "" || parseInt(tempA) < parseInt(tempB)) {
        return -1; // Place empty strings at the end
      } else {
        return parseInt(tempA) < parseInt(tempB); // Sort non-empty strings

        // return tempA.localeCompare(tempB); // Sort non-empty strings
      }
    });
  }

  return (
    <div className="bg-dark min-vh-100 px-2">
      <>{isExploding && <ConfettiExplosion duration={3000} />}</>
      <div className="pt-2 fs-2 fw-bold text-light d-flex flex-row justify-content-center align-items-center gap-1">
        {edit ? (
          <span>${income}</span>
        ) : (
          <span>
            <InputGroup className="">
              <InputGroup.Text>Pay $</InputGroup.Text>
              <Form.Control
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </InputGroup>
          </span>
        )}
        <FaMinus size={15} />
        <span className="text-danger">${billSum}</span>
        <FaEquals size={15} />
        <span className={takeHome > 0 ? "text-success" : "text-danger"}>
          ${takeHome}
        </span>
      </div>
      <div className="my-3 d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={() => onReset()}>
          Reset
        </Button>
        <div className="d-flex flex-row align-items-center fs-2 fw-bold text-light gap-2">
          <FaPiggyBank />
          <span className="text-danger">${afterPay}</span>
        </div>

        {edit ? (
          <Button
            variant="outline-secondary"
            onClick={() => {
              setIsExploding(false);
              setEdit(false);
            }}
          >
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
