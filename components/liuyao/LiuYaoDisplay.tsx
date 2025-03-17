import React, { useEffect, useState } from 'react';
import { LiuYao, Gua, YaoType, LiuQin, LiuShen, TianGan, DiZhi, WuXing } from './liuyao';
import { YAO_CI_DB } from './yaoci';

type QiGuaMethod = 'coins' | 'time' | 'manual';
type BirthdayType = 'solar' | 'lunar';

interface LiuYaoDisplayProps {
    method: QiGuaMethod;
    question: string;
    manualYaos?: number[];
    birthdayType?: BirthdayType;
    birthday?: string;
    birthTime?: number;
}

export const LiuYaoDisplay: React.FC<LiuYaoDisplayProps> = ({
    method,
    question,
    manualYaos,
    birthdayType,
    birthday,
    birthTime
}) => {
    const [benGua, setBenGua] = useState<Gua | null>(null);
    const [bianGua, setBianGua] = useState<Gua | null>(null);
    const [fuGua, setFuGua] = useState<Gua | null>(null);
    const [huGua, setHuGua] = useState<Gua | null>(null);
    const [cuoGua, setCuoGua] = useState<Gua | null>(null);
    const [zongGua, setZongGua] = useState<Gua | null>(null);
    const [yaoCi, setYaoCi] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');

    useEffect(() => {
        const liuyao = LiuYao.getInstance();
        let gua: Gua;

        try {
            // 根据不同的起卦方式获取卦象
            if (method === 'coins') {
                gua = liuyao.qiGuaByCoins();
            } else if (method === 'time') {
                if (birthday) {
                    // 解析日期
                    const dateParts = birthday.split('-').map(part => parseInt(part.trim()));
                    if (dateParts.length >= 3) {
                        const year = dateParts[0];
                        const month = dateParts[1];
                        const day = dateParts[2];

                        // 使用指定的日期和时辰起卦
                        gua = liuyao.qiGuaBySpecificTime(year, month, day, birthTime || 0, birthdayType === 'lunar');
                    } else {
                        throw new Error("日期格式不正确，请使用'年-月-日'格式");
                    }
                } else {
                    // 如果没有提供日期，使用当前时间
                    gua = liuyao.qiGuaByTime();
                }
            } else if (method === 'manual' && manualYaos) {
                gua = liuyao.qiGuaByManual(manualYaos);
            } else {
                // 默认使用铜钱起卦
                gua = liuyao.qiGuaByCoins();
            }

            // 装卦
            const fullGua = liuyao.naJia(gua);
            const fullGuaWithLiuQin = liuyao.anLiuQin(fullGua);
            const benGuaWithLiuShen = liuyao.anLiuShen(fullGuaWithLiuQin);

            // 计算六卦
            // 1. 本卦
            const benGuaFull = benGuaWithLiuShen;

            // 2. 变卦
            const bianGuaRaw = liuyao.calculateBianGua(benGuaFull);
            const bianGuaWithJia = liuyao.naJia(bianGuaRaw);
            const bianGuaWithLiuQin = liuyao.anLiuQin(bianGuaWithJia);
            const bianGuaFull = liuyao.anLiuShen(bianGuaWithLiuQin);

            // 3. 伏卦
            const fuGuaRaw = liuyao.calculateFuGua(benGuaFull);
            const fuGuaWithJia = liuyao.naJia(fuGuaRaw);
            const fuGuaWithLiuQin = liuyao.anLiuQin(fuGuaWithJia);
            const fuGuaFull = liuyao.anLiuShen(fuGuaWithLiuQin);

            // 4. 互卦
            const huGuaRaw = liuyao.calculateHuGua(benGuaFull);
            const huGuaWithJia = liuyao.naJia(huGuaRaw);
            const huGuaWithLiuQin = liuyao.anLiuQin(huGuaWithJia);
            const huGuaFull = liuyao.anLiuShen(huGuaWithLiuQin);

            // 5. 错卦
            const cuoGuaRaw = liuyao.calculateCuoGua(benGuaFull);
            const cuoGuaWithJia = liuyao.naJia(cuoGuaRaw);
            const cuoGuaWithLiuQin = liuyao.anLiuQin(cuoGuaWithJia);
            const cuoGuaFull = liuyao.anLiuShen(cuoGuaWithLiuQin);

            // 6. 综卦
            const zongGuaRaw = liuyao.calculateZongGua(benGuaFull);
            const zongGuaWithJia = liuyao.naJia(zongGuaRaw);
            const zongGuaWithLiuQin = liuyao.anLiuQin(zongGuaWithJia);
            const zongGuaFull = liuyao.anLiuShen(zongGuaWithLiuQin);

            // 获取爻辞
            const yaoCiArray = benGuaFull.yaos.map(yao => liuyao.getYaoCi(yao, benGuaFull.guaIndex));

            // 断卦
            const duanGuaResult = liuyao.duanGua(benGuaFull);

            setBenGua(benGuaFull);
            setBianGua(bianGuaFull);
            setFuGua(fuGuaFull);
            setHuGua(huGuaFull);
            setCuoGua(cuoGuaFull);
            setZongGua(zongGuaFull);
            setYaoCi(yaoCiArray);
            setInterpretation(duanGuaResult);
            setError(null);
        } catch (err) {
            console.error("排盘出错:", err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, [method, question, manualYaos, birthdayType, birthday, birthTime]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error || !benGua) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="text-center text-red-500">
                    <h2 className="text-xl font-bold mb-2">排盘出错</h2>
                    <p>{error || "未知错误"}</p>
                </div>
            </div>
        );
    }

    // 渲染爻的符号
    const renderYaoSymbol = (yaoType: YaoType) => {
        switch (yaoType) {
            case YaoType.YangYao:
                return <div className="h-2 bg-black w-12 md:w-16"></div>;
            case YaoType.YinYao:
                return <div className="flex justify-between w-12 md:w-16">
                    <div className="h-2 bg-black w-5 md:w-7"></div>
                    <div className="h-2 bg-black w-5 md:w-7"></div>
                </div>;
            case YaoType.OldYangYao:
                return <div className="relative">
                    <div className="h-2 bg-black w-12 md:w-16"></div>
                    <div className="absolute -right-4 top-0 text-red-500 text-xs">○</div>
                </div>;
            case YaoType.OldYinYao:
                return <div className="relative flex justify-between w-12 md:w-16">
                    <div className="h-2 bg-black w-5 md:w-7"></div>
                    <div className="h-2 bg-black w-5 md:w-7"></div>
                    <div className="absolute -right-4 top-0 text-red-500 text-xs">×</div>
                </div>;
            default:
                return null;
        }
    };

    // 获取六亲文字
    const getLiuQinText = (liuQin?: LiuQin) => {
        if (liuQin === undefined) return '';
        const texts = ['父母', '子孙', '兄弟', '妻财', '官鬼'];
        return texts[liuQin];
    };

    // 获取六神文字
    const getLiuShenText = (liuShen?: LiuShen) => {
        if (liuShen === undefined) return '';
        const texts = ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武'];
        return texts[liuShen];
    };

    // 获取天干文字
    const getTianGanText = (tianGan?: TianGan) => {
        if (tianGan === undefined) return '';
        const texts = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        return texts[tianGan];
    };

    // 获取地支文字
    const getDiZhiText = (diZhi?: DiZhi) => {
        if (diZhi === undefined) return '';
        const texts = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        return texts[diZhi];
    };

    // 获取五行文字
    const getWuXingText = (wuXing?: WuXing) => {
        if (wuXing === undefined) return '';
        const texts = ['金', '木', '水', '火', '土'];
        return texts[wuXing];
    };

    // 获取五行颜色
    const getWuXingColor = (wuXing?: WuXing) => {
        if (wuXing === undefined) return 'text-black';
        const colors = [
            'text-yellow-600', // 金
            'text-green-600',  // 木
            'text-blue-600',   // 水
            'text-red-600',    // 火
            'text-yellow-800'  // 土
        ];
        return colors[wuXing];
    };

    // 获取爻名
    const getYaoName = (position: number, yaoType: YaoType) => {
        const isYang = yaoType === YaoType.YangYao || yaoType === YaoType.OldYangYao;

        switch (position) {
            case 6: return isYang ? '上九' : '上六';
            case 5: return isYang ? '九五' : '六五';
            case 4: return isYang ? '九四' : '六四';
            case 3: return isYang ? '九三' : '六三';
            case 2: return isYang ? '九二' : '六二';
            case 1: return isYang ? '初九' : '初六';
            default: return '';
        }
    };

    // 添加一个函数来获取世爻的描述
    const getShiYaoDescription = (gua: Gua | null) => {
        if (!gua) return '';

        // 根据卦的性质确定世爻描述
        // 一般来说，乾、坎、艮、震为阳卦；坤、离、巽、兑为阴卦
        const isYangGua = [0, 5, 6, 3].includes(gua.upperTrigram) || [0, 5, 6, 3].includes(gua.lowerTrigram);

        // 根据卦的世爻位置确定描述
        switch (gua.shiYao) {
            case 1: return isYangGua ? '初世' : '游魂';
            case 2: return isYangGua ? '二世' : '归魂';
            case 3: return isYangGua ? '三世' : '纯卦';
            case 4: return isYangGua ? '四世' : '游魂';
            case 5: return isYangGua ? '五世' : '归魂';
            case 6: return isYangGua ? '上世' : '纯卦';
            default: return '';
        }
    };

    // 渲染单个卦表格
    const renderGuaTable = (gua: Gua | null, title: string) => {
        if (!gua) return null;

        const shiYaoDescription = getShiYaoDescription(gua);

        return (
            <div className="mb-4 rounded-lg overflow-hidden shadow-sm">
                <div className="flex justify-center items-center p-2 bg-gray-50 gap-2 text-sm">
                    <div className="font-semibold border px-2 py-1 rounded-md bg-gray-50 border-gray-300">{title}: {gua.guaName}</div>
                    <div className="font-semibold border px-2 py-1 rounded-md bg-green-50 border-green-300">{shiYaoDescription}</div>
                    <div className="font-semibold border px-2 py-1 rounded-md bg-blue-50 border-blue-300">卦身: {getDiZhiText(gua.yaos[0].diZhi)}</div>
                </div>
                <div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-1 px-2 text-left">爻名</th>
                                <th className="py-1 px-2 text-center">卦象</th>
                                <th className="py-1 px-2 text-center">世应</th>
                                <th className="py-1 px-2 text-center">六亲</th>
                                <th className="py-1 px-2 text-center">干支</th>
                                <th className="py-1 px-2 text-center">五行</th>
                                <th className="py-1 px-2 text-center">六神</th>
                                <th className="py-1 px-2 text-left">爻辞</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gua.yaos.slice().reverse().map((yao, index) => {
                                const position = 6 - index;
                                const yaoName = getYaoName(position, yao.type);

                                // 获取对应的爻辞
                                let yaoCiText = '';
                                if (YAO_CI_DB[gua.guaIndex] && YAO_CI_DB[gua.guaIndex][5 - index]) {
                                    yaoCiText = YAO_CI_DB[gua.guaIndex][5 - index];
                                }

                                return (
                                    <tr key={`${title}-${position}`} className="hover:bg-gray-50">
                                        <td className="py-1 px-2">{yaoName}</td>
                                        <td className="py-1 px-2 flex justify-center">
                                            {renderYaoSymbol(yao.type)}
                                        </td>
                                        <td className="py-1 px-2 text-center">
                                            {yao.isShiYao ? '世' : yao.isYingYao ? '应' : ''}
                                        </td>
                                        <td className="py-1 px-2 text-center">{getLiuQinText(yao.liuQin)}</td>
                                        <td className="py-1 px-2 text-center">
                                            {getTianGanText(yao.tianGan)}{getDiZhiText(yao.diZhi)}
                                        </td>
                                        <td className={`py-1 px-2 text-center ${getWuXingColor(yao.wuXing)}`}>
                                            {getWuXingText(yao.wuXing)}
                                        </td>
                                        <td className="py-1 px-2 text-center">{getLiuShenText(yao.liuShen)}</td>
                                        <td className="py-1 px-2 text-xs relative">
                                            {yaoCiText}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="p-2 md:p-6 bg-white rounded-lg shadow-md">

            <div className="grid grid-cols-1 gap-4">
                {/* 本卦和变卦 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        {renderGuaTable(benGua, '本卦')}
                    </div>
                    <div>
                        {renderGuaTable(bianGua, '变卦')}
                    </div>
                </div>

                {/* 互卦和错卦 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        {renderGuaTable(huGua, '互卦')}
                    </div>
                    <div>
                        {renderGuaTable(cuoGua, '错卦')}
                    </div>
                </div>

                {/* 综卦和伏卦 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        {renderGuaTable(zongGua, '综卦')}
                    </div>
                    <div>
                        {renderGuaTable(fuGua, '伏卦')}
                    </div>
                </div>
            </div>

            {/* 卦象详细信息 
            <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">卦象详细信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium mb-1">卦象信息</h4>
                        <p className="text-sm">卦名：{benGua.guaName}</p>
                        <p className="text-sm">卦序：{benGua.guaIndex}</p>
                        <p className="text-sm">五行：{getWuXingText(benGua.guaWuXing)}</p>
                        <p className="text-sm">世爻：第{benGua.shiYao}爻</p>
                        <p className="text-sm">应爻：第{benGua.yingYao}爻</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium mb-1">起卦信息</h4>
                        <p className="text-sm">起卦方式：{method === 'coins' ? '铜钱起卦' : method === 'time' ? '时间起卦' : '手工起卦'}</p>
                        {method === 'time' && birthday && (
                            <>
                                <p className="text-sm">日期：{birthday} ({birthdayType === 'lunar' ? '农历' : '阳历'})</p>
                                <p className="text-sm">时辰：{birthTime}</p>
                            </>
                        )}
                        <p className="text-sm">日干：{getTianGanText(benGua.dayGan)}</p>
                    </div>
                </div>
            </div>*/}

            {/* 卦象解释 
            <div className="mt-4 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">卦象解释</h3>
                <div className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-line">
                    {interpretation}
                </div>
            </div>*/}
        </div>
    );
}; 