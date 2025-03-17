'use client';

import React, { useState } from "react";
import { LiuYaoDisplay } from "@/components/liuyao/LiuYaoDisplay";
import { YaoType } from "@/components/liuyao/liuyao";

type QiGuaMethod = 'coins' | 'time' | 'manual';
type BirthdayType = 'solar' | 'lunar';

type Options = {
    method: QiGuaMethod;
    question: string;
    manualYaos?: number[];
    birthdayType?: BirthdayType;
    birthday?: string;
    birthTime?: number;
}

const LiuYao = () => {
    const [method, setMethod] = useState<QiGuaMethod>('time');
    const [question, setQuestion] = useState('');
    const [manualYaos, setManualYaos] = useState<number[]>([0, 0, 0, 0, 0, 0]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [birthdayType, setBirthdayType] = useState<BirthdayType>('solar');
    const [birthday, setBirthday] = useState('');
    const [birthTime, setBirthTime] = useState('1');
    const [options, setOptions] = useState<Options>({
        method: 'time',
        question: '',
    });

    const handleYaoChange = (index: number, value: number) => {
        const newYaos = [...manualYaos];
        newYaos[index] = value;
        setManualYaos(newYaos);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoaded(true);
        setOptions({
            method,
            question,
            manualYaos: method === 'manual' ? manualYaos : undefined,
            birthdayType: method === 'time' ? birthdayType : undefined,
            birthday: method === 'time' ? birthday : undefined,
            birthTime: method === 'time' ? Number(birthTime) : undefined
        });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] p-4 gap-4">
            <div>
                {isLoaded && <LiuYaoDisplay {...options} />}
            </div>
            <div className="w-full mx-auto p-6 bg-gradient-to-b rounded-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">
                            <span className="text-red-500">*</span> 起卦方式
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {/**<button
                                type="button"
                                className={`px-4 py-2 rounded-md ${method === 'coins'
                                    ? 'bg-purple-700 text-white'
                                    : 'bg-white text-gray-700'
                                    }`}
                                onClick={() => setMethod('coins')}
                            >
                                铜钱起卦
                            </button> */}
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-md ${method === 'time'
                                    ? 'bg-purple-700 text-white'
                                    : 'bg-white text-gray-700'
                                    }`}
                                onClick={() => setMethod('time')}
                            >
                                时间起卦
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-md ${method === 'manual'
                                    ? 'bg-purple-700 text-white'
                                    : 'bg-white text-gray-700'
                                    }`}
                                onClick={() => setMethod('manual')}
                            >
                                手工起卦
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">
                            <span className="text-red-500">*</span> 求测问题
                        </label>
                        {/* <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={3}
                        />
                         */}
                    </div>

                    {method === 'time' && (
                        <>
                            <div>
                                <label className="block text-sm mb-1">
                                    <span className="text-red-500">*</span> 日期类型
                                </label>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-md ${birthdayType === 'solar'
                                            ? 'bg-purple-700 text-white'
                                            : 'bg-white text-gray-700'
                                            }`}
                                        onClick={() => setBirthdayType('solar')}
                                    >
                                        阳历
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-md ${birthdayType === 'lunar'
                                            ? 'bg-purple-700 text-white'
                                            : 'bg-white text-gray-700'
                                            }`}
                                        onClick={() => setBirthdayType('lunar')}
                                    >
                                        农历
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm mb-1">
                                    <span className="text-red-500">*</span> 日期
                                    <span className="inline-block ml-1 text-gray-400 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                    placeholder="例如: 2025-3-15"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">
                                    <span className="text-red-500">*</span> 时辰
                                    <span className="inline-block ml-1 text-gray-400 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={birthTime}
                                        onChange={(e) => setBirthTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
                                    >
                                        <option value="0">早子时(00:00~01:00)</option>
                                        <option value="1">丑时(01:00~03:00)</option>
                                        <option value="2">寅时(03:00~05:00)</option>
                                        <option value="3">卯时(05:00~07:00)</option>
                                        <option value="4">辰时(07:00~09:00)</option>
                                        <option value="5">巳时(09:00~11:00)</option>
                                        <option value="6">午时(11:00~13:00)</option>
                                        <option value="7">未时(13:00~15:00)</option>
                                        <option value="8">申时(15:00~17:00)</option>
                                        <option value="9">酉时(17:00~19:00)</option>
                                        <option value="10">戌时(19:00~21:00)</option>
                                        <option value="11">亥时(21:00~23:00)</option>
                                        <option value="12">晚子时(23:00~00:00)</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {method === 'manual' && (
                        <div>
                            <label className="block text-sm mb-1">
                                <span className="text-red-500">*</span> 手动设置六爻
                            </label>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1, 0].map((index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <span className="w-8 text-right">{index + 1}爻:</span>
                                        <div className="relative">
                                            <select
                                                value={manualYaos[index]}
                                                onChange={(e) => handleYaoChange(index, parseInt(e.target.value))}
                                                className="w-full px-3 py-1 border border-gray-300 rounded-md appearance-none"
                                            >
                                                <option value={YaoType.YangYao}>少阳 ⚊ (不变)</option>
                                                <option value={YaoType.YinYao}>少阴 ⚋ (不变)</option>
                                                <option value={YaoType.OldYangYao}>老阳 ⚊○ (变爻)</option>
                                                <option value={YaoType.OldYinYao}>老阴 ⚋× (变爻)</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 bg-purple-700 text-white font-medium rounded-md hover:bg-purple-800 transition duration-200"
                    >
                        起卦
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LiuYao; 