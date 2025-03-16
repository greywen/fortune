'use client';

import { Iztrolabe } from "@/components/Iztrolabe";
import { GenderName } from "iztro/lib/i18n";
import { useState } from "react";

type BirthdayType = 'solar' | 'lunar';

type Options = {
    birthdayType: BirthdayType;
    birthday: string;
    birthTime: number;
    gender: GenderName;
}

const ZiWei = () => {
    const [birthdayType, setBirthdayType] = useState<BirthdayType>('solar');
    const [birthday, setBirthday] = useState('2025-3-15');
    const [birthTime, setBirthTime] = useState('1');
    const [gender, setGender] = useState<GenderName>('male');
    const [name, setName] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [options, setOptions] = useState<Options>({
        birthdayType: 'solar',
        birthday: '2025-3-15',
        birthTime: 0,
        gender: 'male'
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoaded(true);
        setOptions({ birthdayType, birthday, birthTime: Number(birthTime), gender });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] p-4 gap-4">
            <div>
                {isLoaded && <Iztrolabe
                    {...options}
                // birthday={birthday}
                // birthTime={Number(birthTime)}
                // birthdayType="solar"
                // gender="male"
                // horoscopeDate={new Date()} // 新增参数，设置运限日期【可选，默认为当前时间】
                // horoscopeHour={1}  // 新增参数，设置流时时辰的索引【可选，默认会获取 horoscopeDate 时间】
                />
                }
            </div>
            <div className="w-full mx-auto p-6 bg-gradient-to-b rounded-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                            <span className="text-red-500">*</span> 生日
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

                    <div>
                        <label className="block text-sm mb-1">
                            <span className="text-red-500">*</span> 性别
                        </label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={gender === 'male'}
                                    onChange={() => setGender('male')}
                                    className="form-radio h-5 w-5 text-purple-700"
                                />
                                <span className="ml-2">男</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={gender === 'female'}
                                    onChange={() => setGender('female')}
                                    className="form-radio h-5 w-5 text-purple-700"
                                />
                                <span className="ml-2">女</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">名字</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-purple-700 text-white font-medium rounded-md hover:bg-purple-800 transition duration-200"
                    >
                        排盘
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ZiWei;
