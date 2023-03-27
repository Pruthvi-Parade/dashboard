import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { Select, Input, Button, Divider } from 'antd'
import { InputWithLabel } from '../../Components/Components';

export default function SecurityQuestions({
    security_questions=[],
    setSecurityQuestions=(newSecQuestions) => {alert("Set Security Questions Method not defined")},

}) {

    const setOneSecurityQuestionKey = (index, key, value) => {
        setSecurityQuestions(
            [
                ...security_questions.slice(0, index),
                {
                    ...security_questions[index],
                    [key]: value,
                },
                ...security_questions.slice(index + 1),
            ]
        );
    }
    const removeSecurityQuestion = (index) => {
        setSecurityQuestions(
            [
                ...security_questions.slice(0, index),
                ...security_questions.slice(index + 1),
            ]
        );
    }
    const addSecurityQuestion = () => {
        setSecurityQuestions(
            [
                ...security_questions,
                {
                    question: '',
                    answer: '',
                }
            ]
        );
    }



    return (
        <>
            <div className="my-form-multiple-inline-input">
                <Button type="primary" onClick={addSecurityQuestion}>Add</Button>
            </div>
            {
                security_questions.map((question, index) => (
                    <div className="my-form-multiple-inline-input" key={index}>
                        <InputWithLabel label="Question">
                            <Input
                                value={question.question}
                                style={{minWidth: '600px'}}
                                onChange={(e) => {setOneSecurityQuestionKey(index, 'question', e.target.value)}}
                            />
                        </InputWithLabel>
                        <InputWithLabel label="Answer">
                            <Input
                                value={question.answer}
                                style={{minWidth: '300px'}}
                                onChange={(e) => {setOneSecurityQuestionKey(index, 'answer', e.target.value)}}
                            />
                        </InputWithLabel>
                        <Button type="danger" onClick={() => {removeSecurityQuestion(index)}}>Remove</Button>
                    </div>
                ))
            }
        </>
    )
}
