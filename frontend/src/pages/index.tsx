import type { InferGetStaticPropsType, GetStaticProps } from 'next';
import axios from 'axios';
import App from '../components/App';
import { Note } from '../types';

type Props = {
  initialNotes: Note[];
  initialTotalPages: number;
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const response = await axios.get('http://localhost:3001/notes', {
    params: {
      _page: 1,
      _per_page: 10,
    },
  });
  const initialNotes = response.data;
  const totalNotes = parseInt(response.headers['x-total-count'], 10);
  const initialTotalPages = Math.ceil(totalNotes / 10);

  return {
    props: {
      initialNotes,
      initialTotalPages,
    },
  };
};

export default function Page({
  initialNotes,
  initialTotalPages,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return <App initialNotes={initialNotes} initialTotalPages={initialTotalPages} />;
}
