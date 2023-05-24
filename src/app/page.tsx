'use client'

import {FC, useEffect, useReducer, useState} from "react";
import {useDraw} from "@/hooks/useDraw";
import {v4 as uuid} from 'uuid';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const initialNotesState ={
  lastNoteCreated: null,
  totalNotes: 0,
  notes: [],
}
const notesReducer = (prevState, action) => {
  switch (action.type){
    case 'ADD_NOTE': {
      const newState = {
        lastNoteCreated: new Date().toTimeString().slice(0,8),
        totalNotes: prevState.notes.length +1,
        notes: [...prevState.notes, action.payload]
      }
      console.log('After ADD_NOTE: ', newState);
      return newState;
    }
    case 'DELETE_NOTE': {
      const newState = {
        ...prevState,
        totalNotes: prevState.notes.length -1,
        notes: prevState.notes.filter(note => note.id !== action.payload.id),

      }
      console.log('after delete note ', newState)
      return newState

    }
  }
}
interface pageProps {}




const page: FC<pageProps> = ({}) => {
  const [color, setColor] = useState<string>('#000000')
  const [noteInput, setNoteInput] = useState('')
  const [notesState, dispatch] = useReducer(notesReducer, initialNotesState)

  const addNote = () => {
    event.preventDefault()
    if (!noteInput){
      return;
    }

    const newNote = {
      id: uuid(),
      text: noteInput,
    }

    dispatch({type: 'ADD_NOTE', payload: newNote})

  };
  const {canvasRef, onMouseDown, clear} = useDraw(drawLine)

  const exportPdf = () => {
    const input = document.getElementById("App")
    html2canvas(input, {logging: true, letterRendering: 1, useCORS: true}).then(canvas => {
      const imgWidth = 208;
      const imgHeight = canvas.height * imgWidth/canvas.width;
      const imgData = canvas.toDataURL('img/png')
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save("mijn_canvas.pdf")
    })
  }

  function drawLine({prevPoint, currentPoint, ctx}: Draw){
    const {x: currx, y: currY} = currentPoint
    const lineColor = color
    const lineWidth = 5

    let startPoint = prevPoint ?? currentPoint
    ctx.beginPath()
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = lineColor
    ctx.moveTo(startPoint.x, startPoint.y)
    ctx.lineTo(currx, currY)
    ctx.stroke()
    ctx.fillStyle = lineColor
    ctx.beginPath()
    ctx.arc(startPoint.x, startPoint.y,2,0,2* Math.PI)
    ctx.fill()
  }

  const dropNote = event => {
    event.target.style.left = `${event.pageX - 50}px`
    event.target.style.top = `${event.pageY - 50}px`
  }

  const dragOver = event => {
    event.stopPropagation()
    event.preventDefault()
  }


  return(
        <div onDragOver={dragOver} style={{backgroundColor: "#e17000"}}>

          <form className="note-form " onSubmit={addNote} style={{position: "fixed", right: "15px", zIndex: 3, top: '30px'}}>
                  <textarea placeholder="Create a new note..."
                            value={noteInput}
                            onChange={event => setNoteInput(event.target.value)}
                            style={{paddingBottom: 0}}
                  >
                  </textarea>
          <button
              style={{height: '50px', width: '50px', textAlign: "center", top: 0, verticalAlign: "top", borderRadius: '3px', borderWidth: "3px", backgroundColor: "white", borderColor:"black"}}
          >Add</button>


        </form>
          <button onClick={() => exportPdf()}><img src="/img/PDF_icon.svg.png"
                                                   alt="clear"
                                                   style={{ width: "108px", height: "107px" }}/></button>
          <div style={{position: "fixed", right: "15px", zIndex: 3, top: '100px',display: 'flex', flexDirection: 'column', borderColor:"black",borderWidth:"3px"}}>
          <button color={color} onClick={(e) => setColor('#000000')} className="color"><img
              src="/img/black.png"
              alt="black"
          /></button>
          <button color={color} onClick={(e) => setColor('#FF0000')} className="color"><img
              src="/img/red.png"
              alt="red"
          /></button>
          <button color={color} onClick={(e) => setColor('#0000FF')} className="color"><img
              src="/img/blue.png"
              alt="blue"
          /></button>
          <button color={color} onClick={(e) => setColor('#FFFF00')} className="color"><img
              src="/img/yellow.png"
              alt="yellow"
          /></button>
            <button onClick={clear}><img
                src="/img/trash.png"
                alt="clear"
                style={{ width: "108px", height: "107px" }}
            /></button>
        </div>

        <div id="App"
        className="w-screen h-screen flex justify-center items-center"
        style={{ position: "relative", backgroundColor: "#e17000" }}
    >
          {notesState
            .notes
            .map(note => (
                <div className='note' draggable="true" onDragEnd={dropNote} key={note.id}>
                  <div onClick={() => dispatch({type: 'DELETE_NOTE', payload: note})} className="close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>

                  </div>

                  <pre className="text">{note.text}</pre>
                </div>
            ))
        }
      <div style={{ position: "absolute", zIndex: 1 }}>
        <canvas
            onMouseDown={onMouseDown}
            ref={canvasRef}
            width={1246}
            height={701}
            className="border border-black rounded-md"
        />
      </div>
      <div style={{ position: "absolute", pointerEvents: "none" }}>
        <img
            src="/img/prototypecanvas.PNG"
            alt="Background"
            style={{ width: "100%", height: "100%" }}
        />
      </div>

    </div>

    </div>
)
}

export default page