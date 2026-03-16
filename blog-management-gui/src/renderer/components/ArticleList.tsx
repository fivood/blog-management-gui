import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Input, Select, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { ArticleListItem, ArticleFilters } from '../../shared/types/article';
import { useArticles } from '../hooks/useArticles';
import { useNotification } from '../contexts/NotificationContext';
import { useApp } from '../contexts/AppContext';

const { Search } = Input;
const { Option } = Select;

interface ArticleListProps {
  onEdit: (articleId: string) => void;
  onNew: () => void;
}

/**
 * ArticleListView - Display and manage articles list
 * Requirements: 1.1-1.5, 2.1, 4.1
 * 
 * Features:
 * - Display articles in table with all metadata
 * - Sort by title, createdAt, modifiedAt (ascending/descending)
 * - Search/filter by title and tags
 * - Filter by tags and categories
 * - Password protection indicator
 * - Edit and delete actions
 */
const ArticleList: React.FC<ArticleListProps> = ({ onEdit, onNew }) => {
  const { articles, loading, loadArticles, deleteArticle } = useArticles();
  const { showNotification } = useNotification();
  
  // Filter state
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Sort state
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'modifiedAt'>('modifiedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get all unique tags and categories from articles
  const allTags = useMemo(() => {
    console.log('Calculating allTags, count:', articles.length);
    return Array.from(new Set(articles.flatMap(a => a.tags || [])));
  }, [articles]);
  
  const allCategories = useMemo(() => {
    console.log('Calculating allCategories, count:', articles.length);
    return Array.from(new Set(articles.flatMap(a => a.categories || [])));
  }, [articles]);

  const { state } = useApp();
  const { config } = state;

  // Load articles on mount and when filters or project path change
  useEffect(() => {
    console.log('ArticleList: Load articles effect triggered', { searchText, configPath: config?.hugoProjectPath });
    const filters: ArticleFilters = {};
    if (searchText) filters.searchText = searchText;
    if (selectedTags.length > 0) filters.tags = selectedTags;
    if (selectedCategories.length > 0) filters.categories = selectedCategories;
    
    loadArticles(filters);
  }, [searchText, selectedTags, selectedCategories, loadArticles, config?.hugoProjectPath]);

  // Handle delete with confirmation
  const handleDelete = async (articleId: string, title: string) => {
    const success = await deleteArticle(articleId);
    if (success) {
      showNotification('success', `文章 "${title}" 已删除`);
    } else {
      showNotification('error', '删除文章失败');
    }
  };

  // Handle table sort change
  const handleTableChange: TableProps<ArticleListItem>['onChange'] = (pagination, filters, sorter: any) => {
    if (sorter.field) {
      setSortBy(sorter.field as 'title' | 'createdAt' | 'modifiedAt');
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  // Table columns configuration
  const columns: ColumnsType<ArticleListItem> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      sortOrder: sortBy === 'title' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (text, record) => (
        <Space>
          {text}
          {record.isProtected && (
            <LockOutlined 
              style={{ color: '#faad14' }} 
              title="密码保护"
            />
          )}
          {record.state === 'draft' && <Tag color="orange">草稿</Tag>}
        </Space>
      )
    },
    {
      title: '分类',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories: string[]) => (
        <>
          {categories.map(cat => (
            <Tag key={cat} color="blue">{cat}</Tag>
          ))}
        </>
      )
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      sortOrder: sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (date: string | Date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    },
    {
      title: '修改时间',
      dataIndex: 'modifiedAt',
      key: 'modifiedAt',
      sorter: true,
      sortOrder: sortBy === 'modifiedAt' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
      render: (date: string | Date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record.id)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这篇文章吗？"
            description={`文章标题: ${record.title}`}
            onConfirm={() => handleDelete(record.id, record.title)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ 
      padding: '24px',
      height: 'calc(100vh - 64px)',
      overflow: 'auto'
    }}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="搜索标题或标签"
          allowClear
          style={{ width: 300 }}
          onSearch={setSearchText}
          onChange={(e) => !e.target.value && setSearchText('')}
          prefix={<SearchOutlined />}
        />
        <Select
          mode="multiple"
          placeholder="筛选分类"
          style={{ minWidth: 200 }}
          value={selectedCategories}
          onChange={setSelectedCategories}
          allowClear
        >
          {allCategories.map(cat => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
        </Select>
        <Select
          mode="multiple"
          placeholder="筛选标签"
          style={{ minWidth: 200 }}
          value={selectedTags}
          onChange={setSelectedTags}
          allowClear
        >
          {allTags.map(tag => (
            <Option key={tag} value={tag}>{tag}</Option>
          ))}
        </Select>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onNew}
        >
          新建文章
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 篇文章`
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default ArticleList;
