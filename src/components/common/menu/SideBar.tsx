import axios from 'axios';
import clsx from 'clsx';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type Category = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type SideBarProps = {
  size: 'medium' | 'large';
  className?: string;
  user?: UserType;
};

type UserType = {
  id: number;
};

export const SideBar: React.FC<SideBarProps> = ({size, className, user, ...props}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://mogazoa-api.vercel.app/4-2/categories');
        setCategories(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          alert(`카테고리를 불러오는 데 실패하였습니다: ${error.response}`);
        }
      }
    };

    fetchCategories();
  }, []);

  const isLarge = size === 'large';

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className={clsx('flex', isLarge ? 'w-[22rem]' : 'w-[18rem]', 'flex-col gap-[2rem] bg-[#1c1c22] text-white', className)}>
      <h2 className={clsx('ml-[3rem] mt-[4.5rem]', isLarge ? 'text-[1.6rem]' : 'text-[1.4rem]', 'font-normal')}>카테고리</h2>
      <div className={clsx('mx-auto flex', isLarge ? 'w-[20rem]' : 'w-[16rem]', 'flex-col gap-[0.4rem]')}>
        <ul className='flex flex-col'>
          {categories.map((category) => (
            <Link
              href="#"
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={clsx(isLarge ? 'h-[5rem]' : 'h-[4.5rem]', 'w-[100%] rounded-[0.8rem] px-[2rem] py-[1.5rem]', isLarge ? 'text-[1.6rem]' : 'text-[1.4rem]', 'font-medium', selectedCategory === category.id ? 'bg-[#353542] text-white' : 'text-[#6e6e82]')}
            >
              {category.name}
            </Link>
          ))}
        </ul>
      </div>
      <div className={clsx('mx-auto flex', isLarge ? 'w-[20rem]' : 'w-[16rem]', 'flex-col gap-[0.4rem]')}>
        <Link href='#' className={clsx(isLarge ? 'h-[5rem]' : 'h-[4.5rem]', 'w-[100%] px-[2rem] py-[1.5rem]', isLarge ? 'text-[1.6rem]' : 'text-[1.4rem]', 'font-medium')}>
          {user ? '비교하기' : '로그인'}
        </Link>
        <Link href='#' className={clsx(isLarge ? 'h-[5rem]' : 'h-[4.5rem]', 'w-[100%] px-[2rem] py-[1.5rem]', isLarge ? 'text-[1.6rem]' : 'text-[1.4rem]', 'mb-[4.5rem] font-medium')}>
          {user ? '내 프로필' : '회원가입'}
        </Link>
      </div>
    </div>
  );
};
